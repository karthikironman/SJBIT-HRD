import pool from "../config/db.js";

const handleResponse = (res, status, message, data = null) => {
    res.status(status).json({ status, message, data });
};

export const getAllUsersAdmin = async (req, res, next) => {
    try {
        const result = await pool.query(
            "SELECT id, email, role, is_active, created_at FROM users ORDER BY created_at DESC"
        );
        handleResponse(res, 200, "Users fetched successfully", result.rows);
    } catch (err) {
        next(err);
    }
};

export const getPendingApprovals = async (req, res, next) => {
    try {
        const result = await pool.query(`
            SELECT
                u.id,
                u.email,
                u.sub_tab_statuses,
                u.updated_at,
                sp.full_name,
                sp.usn
            FROM users u
            LEFT JOIN student_profiles sp ON sp.user_id = u.id
            WHERE u.role = 'STUDENT'
              AND u.sub_tab_statuses IS NOT NULL
              AND u.sub_tab_statuses::text LIKE '%PENDING%'
            ORDER BY u.updated_at ASC
        `);
        handleResponse(res, 200, "Pending approvals fetched", result.rows);
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
