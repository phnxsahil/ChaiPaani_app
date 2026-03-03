-- Performance improvements migration
-- 1. Composite index for notification badge count (partial index on unread rows)
-- 2. Composite index for expenses ordered within a group (group detail page)
-- 3. DB-side balance functions (eliminate client-side row iteration)
-- 4. Atomic createGroup RPC

-- ─── INDEXES ──────────────────────────────────────────────────────────────────

-- Badge count: SELECT COUNT(*) WHERE user_id = $1 AND is_read = false
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications (user_id)
  WHERE is_read = false;

-- Group detail page expenses list (group_id filter + time ordering)
CREATE INDEX IF NOT EXISTS idx_expenses_group_created
  ON expenses (group_id, created_at DESC);

-- settlements hot path (who owes/paid whom in a group)
CREATE INDEX IF NOT EXISTS idx_settlements_group_payer_receiver
  ON settlements (group_id, payer_id, receiver_id);

-- ─── FUNCTION: get_my_balance_in_group ────────────────────────────────────────
-- Replaces client-side row iteration in getUserBalance().
-- Returns one row { amount_owed, amount_owes, net_balance } for auth.uid().
-- SECURITY DEFINER bypasses RLS safely; membership guard enforces access.

CREATE OR REPLACE FUNCTION public.get_my_balance_in_group(p_group_id UUID)
RETURNS TABLE (
  amount_owed  DECIMAL(10,2),
  amount_owes  DECIMAL(10,2),
  net_balance  DECIMAL(10,2)
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Membership guard
  IF NOT EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id = p_group_id AND user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'User is not a member of this group';
  END IF;

  RETURN QUERY
  SELECT
    COALESCE(SUM(
      CASE WHEN e.payer_id = v_user_id
                AND es.user_id != v_user_id
                AND NOT es.is_settled
           THEN es.amount ELSE 0 END
    ), 0)::DECIMAL(10,2) AS amount_owed,

    COALESCE(SUM(
      CASE WHEN e.payer_id != v_user_id
                AND es.user_id = v_user_id
                AND NOT es.is_settled
           THEN es.amount ELSE 0 END
    ), 0)::DECIMAL(10,2) AS amount_owes,

    COALESCE(SUM(
      CASE WHEN e.payer_id = v_user_id
                AND es.user_id != v_user_id
                AND NOT es.is_settled
           THEN  es.amount
           WHEN e.payer_id != v_user_id
                AND es.user_id = v_user_id
                AND NOT es.is_settled
           THEN -es.amount
           ELSE 0 END
    ), 0)::DECIMAL(10,2) AS net_balance

  FROM expense_splits es
  JOIN expenses e ON e.id = es.expense_id
  WHERE e.group_id = p_group_id
    AND (e.payer_id = v_user_id OR es.user_id = v_user_id);
END;
$$;


-- ─── FUNCTION: get_balances_for_groups ────────────────────────────────────────
-- Replaces getUserBalancesForGroups() which fired N×2 concurrent queries.
-- Takes an array of group IDs; returns one row per group in a single round-trip.
-- Only returns rows for groups the user is actually a member of.

CREATE OR REPLACE FUNCTION public.get_balances_for_groups(p_group_ids UUID[])
RETURNS TABLE (
  group_id     UUID,
  amount_owed  DECIMAL(10,2),
  amount_owes  DECIMAL(10,2),
  net_balance  DECIMAL(10,2)
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  RETURN QUERY
  SELECT
    e.group_id,

    COALESCE(SUM(
      CASE WHEN e.payer_id = v_user_id
                AND es.user_id != v_user_id
                AND NOT es.is_settled
           THEN es.amount ELSE 0 END
    ), 0)::DECIMAL(10,2),

    COALESCE(SUM(
      CASE WHEN e.payer_id != v_user_id
                AND es.user_id = v_user_id
                AND NOT es.is_settled
           THEN es.amount ELSE 0 END
    ), 0)::DECIMAL(10,2),

    COALESCE(SUM(
      CASE WHEN e.payer_id = v_user_id
                AND es.user_id != v_user_id
                AND NOT es.is_settled
           THEN  es.amount
           WHEN e.payer_id != v_user_id
                AND es.user_id = v_user_id
                AND NOT es.is_settled
           THEN -es.amount
           ELSE 0 END
    ), 0)::DECIMAL(10,2)

  FROM expense_splits es
  JOIN expenses e ON e.id = es.expense_id
  -- Membership guard: only include groups this user belongs to
  JOIN group_members gm ON gm.group_id = e.group_id AND gm.user_id = v_user_id
  WHERE e.group_id = ANY(p_group_ids)
    AND (e.payer_id = v_user_id OR es.user_id = v_user_id)
  GROUP BY e.group_id;
END;
$$;


-- ─── FUNCTION: create_group_with_member ───────────────────────────────────────
-- Atomic replacement for the 2-query createGroup path.
-- Group insert + creator member insert happen in a single transaction.

CREATE OR REPLACE FUNCTION public.create_group_with_member(
  p_name        TEXT,
  p_description TEXT,
  p_category    TEXT DEFAULT 'general'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id  UUID;
  v_group_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  INSERT INTO groups (name, description, category, created_by, currency)
  VALUES (p_name, p_description, p_category, v_user_id, 'INR')
  RETURNING id INTO v_group_id;

  INSERT INTO group_members (group_id, user_id, role, joined_at)
  VALUES (v_group_id, v_user_id, 'admin', NOW());

  RETURN jsonb_build_object(
    'id',          v_group_id,
    'name',        p_name,
    'description', p_description,
    'category',    p_category,
    'created_by',  v_user_id,
    'currency',    'INR'
  );
END;
$$;
