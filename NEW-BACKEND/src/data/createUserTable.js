import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const createUserTable = async () => {
  const CREATE_ENUM = `
    DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('STUDENT', 'SPC', 'FPC', 'ADMIN', 'PARENT', 'SUPER_USER');
    EXCEPTION WHEN duplicate_object THEN null; END $$;
    
    DO $$ BEGIN
        CREATE TYPE status_type AS ENUM ('INCOMPLETE', 'PENDING', 'APPROVED', 'REJECTED');
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
        CREATE TYPE department_branch AS ENUM ('CSE', 'ISE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'CSE_DS', 'MCA', 'MBA');
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
        CREATE TYPE pursuing_degree AS ENUM ('BE', 'MTECH', 'MBA', 'MCA');
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
        CREATE TYPE gender AS ENUM ('MALE', 'FEMALE', 'OTHERS');
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
        CREATE TYPE edu_level AS ENUM ('UG', 'PG');
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
        CREATE TYPE admission_mode AS ENUM ('CET', 'COMED-K', 'PGCET', 'DIPLOMA_CET', 'MANAGEMENT', 'OTHERS');
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
        CREATE TYPE ug_degree_type AS ENUM ('BE', 'BCA', 'BSC', 'BCOM', 'BA', 'BBA', 'BBM', 'COMPUTERS_MCA', 'MARKETING_AND_BUSINESS_ANALYTICS', 'HR_AND_BUSINESS_ANALYTICS', 'FINANCE_AND_BUSINESS_ANALYTICS');
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
        CREATE TYPE pg_spec_type AS ENUM ('MARKETING_AND_HR', 'MARKETING_AND_FINANCE', 'CORE_FINANCE', 'BUSINESS_ANALYTICS', 'MARKETING', 'HR', 'FINANCE', 'COMPUTERS_MCA', 'MARKETING_AND_BUSINESS_ANALYTICS', 'HR_AND_BUSINESS_ANALYTICS', 'FINANCE_AND_BUSINESS_ANALYTICS', 'DIGITAL_MARKETING', 'FINANCE_HR', 'MARKETING_BUSINESS_ANALYTICS', 'HR_BUSINESS_ANALYTICS', 'FINANCE_BUSINESS_ANALYTICS');
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
        CREATE TYPE document_type AS ENUM ('RESUME', 'MARKS_CARD_10TH', 'MARKS_CARD_12TH', 'UG_MARKS_CARD_ALL_SEM', 'PG_MARKS_CARD_ALL_SEM', 'PAN_CARD', 'AADHAAR_CARD', 'PASSPORT_SIZE_PHOTO', 'COLLEGE_ID_CARD');
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
        CREATE TYPE mentor_department AS ENUM ('CSE', 'ISE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'CSE_DS', 'MCA', 'HR', 'FINANCE', 'MARKETING', 'MARKETING_HR', 'MARKETING_FINANCE', 'DIGITAL_MARKETING', 'BUSINESS_ANALYTICS', 'FINANCE_HR', 'MARKETING_BUSINESS_ANALYTICS', 'HR_BUSINESS_ANALYTICS', 'FINANCE_BUSINESS_ANALYTICS');
    EXCEPTION WHEN duplicate_object THEN null; END $$;
  `;

  const CREATE_USERS_TABLE = `
    CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        email_verified BOOLEAN DEFAULT false,
        password_hash TEXT NOT NULL,
        role user_role DEFAULT 'STUDENT',
        is_active BOOLEAN DEFAULT true,
        profile_picture_url TEXT,
        
        -- Dynamic JSONB Tracking for Module Statuses
        sub_tab_statuses JSONB DEFAULT '{}'::jsonb,
        sub_tab_remarks JSONB DEFAULT '{}'::jsonb,
        sub_tab_verified_by JSONB DEFAULT '{}'::jsonb,
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const CREATE_REFRESH_TOKENS_TABLE = `
    CREATE TABLE IF NOT EXISTS refresh_tokens (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        token TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const CREATE_STUDENT_PROFILES_TABLE = `
    CREATE TABLE IF NOT EXISTS student_profiles (
        user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        
        -- Core Info (Rigid schema)
        usn VARCHAR(20) UNIQUE,
        full_name VARCHAR(255),
        first_name VARCHAR(100),
        middle_name VARCHAR(100),
        last_name VARCHAR(100),
        department department_branch,
        pursuing_degree pursuing_degree,
        mobile_number VARCHAR(15),
        whatsapp_number VARCHAR(15),
        gender gender,
        dob DATE,
        mentor_id UUID REFERENCES users(id) ON DELETE SET NULL,
        ug_pg edu_level,
        
        -- Flexible Modules
        personal_info JSONB DEFAULT '{}'::jsonb,
        official_info JSONB DEFAULT '{}'::jsonb,
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const CREATE_ACADEMICS_TABLE = `
    CREATE TABLE IF NOT EXISTS student_academics (
        student_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        
        sslc_perc NUMERIC(5,2),
        puc_perc NUMERIC(5,2),
        sslc_meta JSONB DEFAULT '{}'::jsonb,
        puc_meta JSONB DEFAULT '{}'::jsonb,
        admission_mode admission_mode,
        competitive_ranking VARCHAR(50),
        
        current_cgpa NUMERIC(4,2),
        sgpas JSONB DEFAULT '{}'::jsonb,
        gap_info JSONB DEFAULT '{}'::jsonb,
        active_backlogs INT DEFAULT 0,
        backlog_history BOOLEAN DEFAULT false,
        
        ug_percentage NUMERIC(5,2),
        previous_edu_details JSONB DEFAULT '{}'::jsonb,
        pg_specialization pg_spec_type,
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const CREATE_DOCUMENTS_TABLE = `
    CREATE TABLE IF NOT EXISTS student_documents (
        student_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        documents JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const CREATE_OFFERS_TABLE = `
    CREATE TABLE IF NOT EXISTS student_offers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        student_id UUID REFERENCES users(id) ON DELETE CASCADE,
        company_name VARCHAR(255),
        salary_lpa NUMERIC(10,2),
        offer_letter_url TEXT,
        is_accepted BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    console.log("Setting up database if not existing...");
    await pool.query(CREATE_ENUM);
    await pool.query(CREATE_USERS_TABLE);
    await pool.query(CREATE_REFRESH_TOKENS_TABLE);
    await pool.query(CREATE_STUDENT_PROFILES_TABLE);
    await pool.query(CREATE_ACADEMICS_TABLE);
    await pool.query(CREATE_DOCUMENTS_TABLE);
    await pool.query(CREATE_OFFERS_TABLE);

    // Seed default admin and super_user accounts
    const adminPass = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
    const superPass = process.env.DEFAULT_SUPER_USER_PASSWORD || 'super123';

    const adminHash = await bcrypt.hash(adminPass, 10);
    const superHash = await bcrypt.hash(superPass, 10);

    const SEED_USERS = `
        INSERT INTO users (email, email_verified, password_hash, role) 
        VALUES 
        ('admin@sjbit.edu.in', true, $1, 'ADMIN'),
        ('superuser@sjbit.edu.in', true, $2, 'SUPER_USER')
        ON CONFLICT (email) DO NOTHING;
    `;

    await pool.query(SEED_USERS, [adminHash, superHash]);
    console.log("Database initialized and seeds completed successfully.");
  } catch (err) {
    console.error("Error in creating table:", err);
  }
};

export default createUserTable;