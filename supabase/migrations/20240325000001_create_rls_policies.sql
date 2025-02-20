-- Remove all policies first to avoid conflicts
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Admin can view all users" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Admin can update all users" ON users;

DROP POLICY IF EXISTS "Companies view own data" ON companies;
DROP POLICY IF EXISTS "Admin can view all companies" ON companies;
DROP POLICY IF EXISTS "Companies can update own data" ON companies;
DROP POLICY IF EXISTS "Admin can update all companies" ON companies;

DROP POLICY IF EXISTS "Customers view own requests" ON move_requests;
DROP POLICY IF EXISTS "Companies view assigned requests" ON move_requests;
DROP POLICY IF EXISTS "Admin view all requests" ON move_requests;
DROP POLICY IF EXISTS "Customers can create requests" ON move_requests;
DROP POLICY IF EXISTS "Admin can update requests" ON move_requests;
DROP POLICY IF EXISTS "Anyone can create requests" ON move_requests;

DROP POLICY IF EXISTS "Companies view own assignments" ON move_assignments;
DROP POLICY IF EXISTS "Admin view all assignments" ON move_assignments;
DROP POLICY IF EXISTS "Companies update own assignments" ON move_assignments;
DROP POLICY IF EXISTS "Admin update all assignments" ON move_assignments;

-- Users table policies
CREATE POLICY "Users can view own data"
ON users FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admin can view all users"
ON users FOR SELECT
TO authenticated
USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role = 'admin'
));

CREATE POLICY "Users can update own data"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Admin can update all users"
ON users FOR UPDATE
TO authenticated
USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role = 'admin'
));

-- Companies table policies
CREATE POLICY "Companies view own data"
ON companies FOR SELECT
TO authenticated
USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() 
    AND users.role = 'company'
    AND users.email = companies.contact_email
));

CREATE POLICY "Admin can view all companies"
ON companies FOR SELECT
TO authenticated
USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role = 'admin'
));

CREATE POLICY "Companies can update own data"
ON companies FOR UPDATE
TO authenticated
USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() 
    AND users.role = 'company'
    AND users.email = companies.contact_email
));

CREATE POLICY "Admin can update all companies"
ON companies FOR UPDATE
TO authenticated
USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role = 'admin'
));

-- Move requests table policies
CREATE POLICY "Customers view own requests"
ON move_requests FOR SELECT
TO authenticated
USING (customer_id = auth.uid());

CREATE POLICY "Companies view assigned requests"
ON move_requests FOR SELECT
TO authenticated
USING (EXISTS (
    SELECT 1 FROM move_assignments ma
    JOIN users u ON u.id = auth.uid()
    WHERE ma.request_id = move_requests.id
    AND ma.company_id = (
        SELECT id FROM companies 
        WHERE contact_email = u.email
    )
    AND u.role = 'company'
));

CREATE POLICY "Admin view all requests"
ON move_requests FOR SELECT
TO authenticated
USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role = 'admin'
));

CREATE POLICY "Anyone can create requests"
ON move_requests FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admin can update requests"
ON move_requests FOR UPDATE
TO authenticated
USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role = 'admin'
));

-- Move assignments table policies
CREATE POLICY "Companies view own assignments"
ON move_assignments FOR SELECT
TO authenticated
USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'company'
    AND users.email = (
        SELECT contact_email FROM companies
        WHERE companies.id = move_assignments.company_id
    )
));

CREATE POLICY "Admin view all assignments"
ON move_assignments FOR SELECT
TO authenticated
USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role = 'admin'
));

CREATE POLICY "Companies update own assignments"
ON move_assignments FOR UPDATE
TO authenticated
USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'company'
    AND users.email = (
        SELECT contact_email FROM companies
        WHERE companies.id = move_assignments.company_id
    )
));

CREATE POLICY "Admin update all assignments"
ON move_assignments FOR UPDATE
TO authenticated
USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role = 'admin'
));
