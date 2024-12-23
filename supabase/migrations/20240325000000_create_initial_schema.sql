-- Create enum types first
CREATE TYPE user_role AS ENUM ('customer', 'company', 'admin');
CREATE TYPE request_status AS ENUM ('pending', 'assigned', 'in_progress', 'completed', 'cancelled');
CREATE TYPE assignment_status AS ENUM ('active', 'completed', 'cancelled');

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    email TEXT UNIQUE NOT NULL,
    role user_role NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    address JSONB,
    is_active BOOLEAN DEFAULT true
);

-- Create companies table
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL,
    description TEXT,
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    business_address JSONB NOT NULL,
    service_areas JSONB,
    rating DECIMAL(3,2),
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true
);

-- Create move_requests table
CREATE TABLE move_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    customer_id UUID NOT NULL REFERENCES users(id),
    status request_status DEFAULT 'pending',
    pickup_address JSONB NOT NULL,
    delivery_address JSONB NOT NULL,
    requested_date DATE NOT NULL,
    inventory_list JSONB,
    special_instructions TEXT,
    estimated_size TEXT,
    estimated_value DECIMAL(10,2)
);

-- Create move_assignments table
CREATE TABLE move_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    request_id UUID NOT NULL REFERENCES move_requests(id),
    company_id UUID NOT NULL REFERENCES companies(id),
    status assignment_status DEFAULT 'active',
    assigned_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    completion_notes TEXT
);

-- Create indexes for common queries
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_move_requests_customer ON move_requests(customer_id);
CREATE INDEX idx_move_requests_status ON move_requests(status);
CREATE INDEX idx_move_assignments_company ON move_assignments(company_id);
CREATE INDEX idx_move_assignments_request ON move_assignments(request_id);

-- Add RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE move_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE move_assignments ENABLE ROW LEVEL SECURITY;

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_move_requests_updated_at
    BEFORE UPDATE ON move_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_move_assignments_updated_at
    BEFORE UPDATE ON move_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();