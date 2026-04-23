import pool from "../config/db.js";
import bcrypt from "bcryptjs";

const handleResponse = (res, status, message, data = null) => {
    res.status(status).json({ status, message, data });
};

export const getAllUsersAdmin = async (req, res, next) => {
    console.log('get all users admin controller')
    try {
        const role = req.query.role || 'STUDENT';
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const offset = (page - 1) * limit;

        if (req.user.role === 'FPC' && (role === 'FPC' || role === 'ADMIN' || role === 'SUPER_USER')) {
            return handleResponse(res, 403, "You do not have permission to view this role.");
        }

        let queryStr = `
            SELECT u.id, u.email, u.role, u.is_active, u.created_at, nsp.department_branches::text[] AS department_branches, sp.department
            FROM users u
            LEFT JOIN non_student_profiles nsp ON u.id = nsp.user_id
            LEFT JOIN student_profiles sp ON u.id = sp.user_id
            WHERE u.role = $1
        `;
        let countQueryStr = `
            SELECT COUNT(*) 
            FROM users u
            LEFT JOIN student_profiles sp ON u.id = sp.user_id
            WHERE u.role = $1
        `;
        
        let values = [role];
        let paramIndex = 2;

        if (req.user.role === 'FPC') {
            const r = await pool.query(`SELECT department_branches FROM non_student_profiles WHERE user_id = $1`, [req.user.id]);
            const branches = r.rows[0]?.department_branches || [];
            if (branches.length > 0) {
                queryStr += ` AND sp.department = ANY($${paramIndex}::department_branch[])`;
                countQueryStr += ` AND sp.department = ANY($${paramIndex}::department_branch[])`;
                values.push(branches);
                paramIndex++;
            } else {
                queryStr += ` AND 1 = 0`;
                countQueryStr += ` AND 1 = 0`;
            }
        }

        queryStr += ` ORDER BY u.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        const limitOffsetValues = [...values, limit, offset];

        const result = await pool.query(queryStr, limitOffsetValues);
        const countResult = await pool.query(countQueryStr, values);

        const totalCount = parseInt(countResult.rows[0].count, 10);
        const totalPages = Math.ceil(totalCount / limit);
        console.log({ totalCount, totalPages })
        const data = {
            users: result.rows,
            pagination: {
                totalCount,
                totalPages,
                currentPage: page,
                limit
            }
        };

        handleResponse(res, 200, "Users fetched successfully", data);
    } catch (err) {
        next(err);
    }
};

export const getPendingApprovals = async (req, res, next) => {
    try {
        const approverId = req.user.id;
        const approverRole = req.user.role;
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const offset = (page - 1) * limit;

        let deptFilter = "";
        let filterValues = [];
        let paramIndex = 1;

        if (approverRole === 'SPC') {
            const r = await pool.query(`SELECT department FROM student_profiles WHERE user_id = $1`, [approverId]);
            const dept = r.rows[0]?.department;
            if (dept) {
                deptFilter = `AND sp.department = $${paramIndex}`;
                filterValues.push(dept);
                paramIndex++;
            } else {
                return handleResponse(res, 200, "Pending approvals fetched", { users: [], pagination: { totalCount: 0, totalPages: 0, currentPage: page, limit } });
            }
        } else if (approverRole === 'FPC') {
            const r = await pool.query(`SELECT department_branches FROM non_student_profiles WHERE user_id = $1`, [approverId]);
            const branches = r.rows[0]?.department_branches || [];
            if (branches.length > 0) {
                deptFilter = `AND sp.department = ANY($${paramIndex}::department_branch[])`;
                filterValues.push(branches);
                paramIndex++;
            } else {
                return handleResponse(res, 200, "Pending approvals fetched", { users: [], pagination: { totalCount: 0, totalPages: 0, currentPage: page, limit } });
            }
        }

        const countQuery = `
            SELECT COUNT(*)
            FROM users u
            LEFT JOIN student_profiles sp ON sp.user_id = u.id
            WHERE u.role IN ('STUDENT', 'SPC')
              AND u.sub_tab_statuses IS NOT NULL
              AND u.sub_tab_statuses::text LIKE '%PENDING%'
              ${deptFilter}
        `;
        const countResult = await pool.query(countQuery, filterValues);
        const totalCount = parseInt(countResult.rows[0].count, 10);
        const totalPages = Math.ceil(totalCount / limit);

        const query = `
            SELECT
                u.id,
                u.email,
                u.sub_tab_statuses,
                u.updated_at,
                sp.full_name,
                sp.usn
            FROM users u
            LEFT JOIN student_profiles sp ON sp.user_id = u.id
            WHERE u.role IN ('STUDENT', 'SPC')
              AND u.sub_tab_statuses IS NOT NULL
              AND u.sub_tab_statuses::text LIKE '%PENDING%'
              ${deptFilter}
            ORDER BY u.updated_at ASC
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;
        const limitOffsetValues = [...filterValues, limit, offset];
        const result = await pool.query(query, limitOffsetValues);
        
        // Strip offer_ keys from sub_tab_statuses — offers are managed by FPC/admin, not via this approval flow
        const users = result.rows.map(row => {
            if (!row.sub_tab_statuses) return row;
            const filtered = Object.fromEntries(
                Object.entries(row.sub_tab_statuses).filter(([k]) => !k.startsWith('offer_'))
            );
            return { ...row, sub_tab_statuses: filtered };
        });

        handleResponse(res, 200, "Pending approvals fetched", {
            users,
            pagination: {
                totalCount,
                totalPages,
                currentPage: page,
                limit
            }
        });
    } catch (err) {
        next(err);
    }
};

export const getStudentSubtabData = async (req, res, next) => {
    try {
        const { userId, subtabKey } = req.params;
        let data = {};

        if (subtabKey === 'core_info') {
            const r = await pool.query(`
                SELECT usn, full_name, first_name, middle_name, last_name,
                       department, pursuing_degree, mobile_number, whatsapp_number,
                       gender, dob, mentor_id, ug_pg
                FROM student_profiles WHERE user_id = $1
            `, [userId]);
            data = r.rows[0] || {};
        } else if (subtabKey === 'personal_info') {
            const r = await pool.query(`SELECT personal_info FROM student_profiles WHERE user_id = $1`, [userId]);
            data = r.rows[0]?.personal_info || {};
        } else if (subtabKey === 'official_info') {
            const r = await pool.query(`SELECT official_info FROM student_profiles WHERE user_id = $1`, [userId]);
            data = r.rows[0]?.official_info || {};
        } else if (subtabKey === 'schooling') {
            const r = await pool.query(`
                SELECT sslc_perc, puc_perc, sslc_meta, puc_meta, admission_mode, competitive_ranking
                FROM student_academics WHERE student_id = $1
            `, [userId]);
            data = r.rows[0] || {};
        } else if (subtabKey === 'current_scores') {
            const r = await pool.query(`
                SELECT current_cgpa, sgpas, gap_info, active_backlogs, backlog_history
                FROM student_academics WHERE student_id = $1
            `, [userId]);
            data = r.rows[0] || {};
        } else if (subtabKey === 'previous_edu') {
            const r = await pool.query(`
                SELECT ug_percentage, previous_edu_details, pg_specialization
                FROM student_academics WHERE student_id = $1
            `, [userId]);
            data = r.rows[0] || {};
        } else if (subtabKey.startsWith('offer_')) {
            const offerId = subtabKey.replace('offer_', '');
            const r = await pool.query(`
                SELECT company_name, salary_lpa, offer_letter_url, is_accepted
                FROM student_offers WHERE id = $1 AND student_id = $2
            `, [offerId, userId]);
            data = r.rows[0] || {};
        } else {
            const r = await pool.query(`SELECT documents FROM student_documents WHERE student_id = $1`, [userId]);
            const documents = r.rows[0]?.documents || {};
            data = { document_url: documents[subtabKey] || '' };
        }

        handleResponse(res, 200, "Subtab data fetched", data);
    } catch (err) {
        next(err);
    }
};

export const approveSubtab = async (req, res, next) => {
    try {
        const { userId, subtabKey } = req.params;
        const approverId = req.user.id;

        await pool.query(`
            UPDATE users
            SET sub_tab_statuses = jsonb_set(COALESCE(sub_tab_statuses, '{}'::jsonb), ARRAY[$2::text], '"APPROVED"'),
                sub_tab_verified_by = jsonb_set(COALESCE(sub_tab_verified_by, '{}'::jsonb), ARRAY[$2::text], to_jsonb($3::text))
            WHERE id = $1
        `, [userId, subtabKey, approverId]);

        handleResponse(res, 200, "Subtab approved successfully");
    } catch (err) {
        next(err);
    }
};

export const rejectSubtab = async (req, res, next) => {
    try {
        const { userId, subtabKey } = req.params;
        const { remarks } = req.body;
        const approverId = req.user.id;

        await pool.query(`
            UPDATE users
            SET sub_tab_statuses = jsonb_set(COALESCE(sub_tab_statuses, '{}'::jsonb), ARRAY[$2::text], '"REJECTED"'),
                sub_tab_remarks = jsonb_set(COALESCE(sub_tab_remarks, '{}'::jsonb), ARRAY[$2::text], to_jsonb($3::text)),
                sub_tab_verified_by = jsonb_set(COALESCE(sub_tab_verified_by, '{}'::jsonb), ARRAY[$2::text], to_jsonb($4::text))
            WHERE id = $1
        `, [userId, subtabKey, remarks || '', approverId]);

        handleResponse(res, 200, "Subtab rejected successfully");
    } catch (err) {
        next(err);
    }
};

export const updateUserRole = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        
        const validRoles = ['STUDENT', 'SPC', 'FPC', 'ADMIN', 'PARENT', 'SUPER_USER'];
        if (!validRoles.includes(role)) {
            return handleResponse(res, 400, "Invalid role provided.");
        }

        const result = await pool.query(
            "UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, role",
            [role, id]
        );

        if (result.rowCount === 0) {
            return handleResponse(res, 404, "User not found.");
        }

        handleResponse(res, 200, "User role updated successfully", result.rows[0]);
    } catch (err) {
        next(err);
    }
};

export const createBulkFPCs = async (req, res, next) => {
    const client = await pool.connect();
    try {
        const { fpcs } = req.body;
        if (!Array.isArray(fpcs) || fpcs.length === 0) {
            return handleResponse(res, 400, "Please provide an array of FPC data objects.");
        }

        const passwordHash = await bcrypt.hash('Password123!', 10);
        const successful = [];
        const failed = [];

        await client.query("BEGIN");

        for (const item of fpcs) {
            try {
                const trimmedEmail = item.email?.trim().toLowerCase();
                const branches = item.department_branches;

                if (!trimmedEmail || !Array.isArray(branches) || branches.length === 0) continue;

                const userResult = await client.query(`
                    INSERT INTO users (email, password_hash, role, email_verified, is_active)
                    VALUES ($1, $2, 'FPC', true, true)
                    RETURNING id
                `, [trimmedEmail, passwordHash]);
                
                const userId = userResult.rows[0].id;

                await client.query(`
                    INSERT INTO non_student_profiles (user_id, department_branches)
                    VALUES ($1, $2::department_branch[])
                `, [userId, branches]);

                successful.push(trimmedEmail);
            } catch (err) {
                failed.push(item.email);
            }
        }

        await client.query("COMMIT");

        handleResponse(res, 200, "Bulk FPC creation completed.", {
            successful,
            failed
        });
    } catch (err) {
        await client.query("ROLLBACK");
        next(err);
    } finally {
        client.release();
    }
};

export const updateFpcDepartments = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { department_branches } = req.body;
        
        if (!Array.isArray(department_branches)) {
            return handleResponse(res, 400, "department_branches must be an array");
        }

        const result = await pool.query(`
            UPDATE non_student_profiles 
            SET department_branches = $1::department_branch[]
            WHERE user_id = $2
            RETURNING department_branches::text[] AS department_branches
        `, [department_branches, id]);

        if (result.rowCount === 0) {
             return handleResponse(res, 404, "FPC profile not found.");
        }

        handleResponse(res, 200, "FPC departments updated successfully", result.rows[0]);
    } catch (err) {
        next(err);
    }
};

export const searchStudents = async (req, res, next) => {
    try {
        const q = (req.query.q || '').trim();
        if (q.length < 2) return handleResponse(res, 200, "Search results", []);

        const { role, id: userId } = req.user;
        let deptFilter = '';
        const values = [`%${q}%`, `%${q}%`];
        let paramIndex = 3;

        if (role === 'SPC') {
            const r = await pool.query(`SELECT department FROM student_profiles WHERE user_id = $1`, [userId]);
            const dept = r.rows[0]?.department;
            if (!dept) return handleResponse(res, 200, "Search results", []);
            deptFilter = `AND sp.department = $${paramIndex}`;
            values.push(dept);
            paramIndex++;
        } else if (role === 'FPC') {
            const r = await pool.query(`SELECT department_branches FROM non_student_profiles WHERE user_id = $1`, [userId]);
            const branches = r.rows[0]?.department_branches || [];
            if (branches.length === 0) return handleResponse(res, 200, "Search results", []);
            deptFilter = `AND sp.department = ANY($${paramIndex}::department_branch[])`;
            values.push(branches);
            paramIndex++;
        }

        const result = await pool.query(`
            SELECT u.id, sp.full_name, sp.usn, sp.department, sp.pursuing_degree, u.email
            FROM users u
            LEFT JOIN student_profiles sp ON sp.user_id = u.id
            WHERE u.role IN ('STUDENT', 'SPC')
              AND (sp.full_name ILIKE $1 OR sp.usn ILIKE $2)
              ${deptFilter}
            ORDER BY sp.full_name ASC
            LIMIT 8
        `, values);

        handleResponse(res, 200, "Search results", result.rows);
    } catch (err) {
        next(err);
    }
};

export const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING id", [id]);
        
        if (result.rowCount === 0) {
            return handleResponse(res, 404, "User not found.");
        }
        
        handleResponse(res, 200, "User safely removed.");
    } catch (err) {
        next(err);
    }
};
