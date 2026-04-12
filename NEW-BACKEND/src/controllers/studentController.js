import pool from "../config/db.js";

// Helper to uniformly send response with user status
const sendResponseWithStatus = async (res, userId, data, subTabId) => {
  const statusRes = await pool.query("SELECT sub_tab_statuses, sub_tab_remarks FROM users WHERE id = $1", [userId]);
  const statuses = statusRes.rows[0].sub_tab_statuses || {};
  const remarks = statusRes.rows[0].sub_tab_remarks || {};
  
  res.status(200).json({
    data: data || {},
    status: statuses[subTabId] || 'INCOMPLETE',
    remarks: remarks[subTabId] || ''
  });
};
export const getStatuses = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const statusRes = await pool.query("SELECT sub_tab_statuses FROM users WHERE id = $1", [userId]);
    const statuses = statusRes.rows[0]?.sub_tab_statuses || {};
    res.status(200).json({ statuses });
  } catch (error) {
    next(error);
  }
};

export const getCoreInfo = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(`
      SELECT usn, full_name, first_name, middle_name, last_name, 
             department, pursuing_degree, mobile_number, whatsapp_number, 
             gender, dob, mentor_id, ug_pg 
      FROM student_profiles WHERE user_id = $1
    `, [userId]);

    await sendResponseWithStatus(res, userId, result.rows[0], 'core_info');
  } catch (error) {
    next(error);
  }
};

export const saveCoreInfo = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { 
      usn, full_name, first_name, middle_name, last_name, 
      department, pursuing_degree, mobile_number, whatsapp_number, 
      gender, dob, ug_pg, mentor_id 
    } = req.body;

    await pool.query(`
      INSERT INTO student_profiles 
      (user_id, usn, full_name, first_name, middle_name, last_name, department, pursuing_degree, mobile_number, whatsapp_number, gender, dob, ug_pg, mentor_id) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      ON CONFLICT (user_id) DO UPDATE SET 
        usn = EXCLUDED.usn, full_name = EXCLUDED.full_name, first_name = EXCLUDED.first_name, 
        middle_name = EXCLUDED.middle_name, last_name = EXCLUDED.last_name, department = EXCLUDED.department, 
        pursuing_degree = EXCLUDED.pursuing_degree, mobile_number = EXCLUDED.mobile_number, 
        whatsapp_number = EXCLUDED.whatsapp_number, gender = EXCLUDED.gender, dob = EXCLUDED.dob, 
        ug_pg = EXCLUDED.ug_pg, mentor_id = EXCLUDED.mentor_id
    `, [userId, usn||null, full_name||null, first_name||null, middle_name||null, last_name||null, department||null, pursuing_degree||null, mobile_number||null, whatsapp_number||null, gender||null, dob||null, ug_pg||null, mentor_id||null]);

    // Update status to PENDING
    await pool.query(`
      UPDATE users 
      SET sub_tab_statuses = jsonb_set(COALESCE(sub_tab_statuses, '{}'::jsonb), '{core_info}', '"PENDING"') 
      WHERE id = $1
    `, [userId]);

    res.status(200).json({ message: "Core Info saved successfully" });
  } catch (error) {
    next(error);
  }
};

export const getPersonalInfo = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await pool.query("SELECT personal_info FROM student_profiles WHERE user_id = $1", [userId]);
    const data = result.rows[0]?.personal_info || {};
    await sendResponseWithStatus(res, userId, data, 'personal_info');
  } catch (error) {
    next(error);
  }
};

export const savePersonalInfo = async (req, res, next) => {
  try {
    const userId = req.user.id;
    // We store the entire JSON body as personal_info JSONB
    const jsonPayload = JSON.stringify(req.body);

    await pool.query(`
      INSERT INTO student_profiles (user_id, personal_info) 
      VALUES ($1, $2::jsonb)
      ON CONFLICT (user_id) DO UPDATE SET personal_info = EXCLUDED.personal_info
    `, [userId, jsonPayload]);

    await pool.query(`
      UPDATE users 
      SET sub_tab_statuses = jsonb_set(COALESCE(sub_tab_statuses, '{}'::jsonb), '{personal_info}', '"PENDING"') 
      WHERE id = $1
    `, [userId]);

    res.status(200).json({ message: "Personal Info saved successfully" });
  } catch (error) {
    next(error);
  }
};

export const getOfficialInfo = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await pool.query("SELECT official_info FROM student_profiles WHERE user_id = $1", [userId]);
    const data = result.rows[0]?.official_info || {};
    await sendResponseWithStatus(res, userId, data, 'official_info');
  } catch (error) {
    next(error);
  }
};

export const saveOfficialInfo = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const jsonPayload = JSON.stringify(req.body);

    await pool.query(`
      INSERT INTO student_profiles (user_id, official_info) 
      VALUES ($1, $2::jsonb)
      ON CONFLICT (user_id) DO UPDATE SET official_info = EXCLUDED.official_info
    `, [userId, jsonPayload]);

    await pool.query(`
      UPDATE users 
      SET sub_tab_statuses = jsonb_set(COALESCE(sub_tab_statuses, '{}'::jsonb), '{official_info}', '"PENDING"') 
      WHERE id = $1
    `, [userId]);

    res.status(200).json({ message: "Official Info saved successfully" });
  } catch (error) {
    next(error);
  }
};

export const getSchooling = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      "SELECT sslc_perc, puc_perc, sslc_meta, puc_meta, admission_mode, competitive_ranking FROM student_academics WHERE student_id = $1", 
      [userId]
    );
    const data = result.rows[0] || {};
    await sendResponseWithStatus(res, userId, data, 'schooling');
  } catch (error) {
    next(error);
  }
};

export const saveSchooling = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { sslc_perc, puc_perc, sslc_meta, puc_meta, admission_mode, competitive_ranking } = req.body;
    
    await pool.query(`
      INSERT INTO student_academics (student_id, sslc_perc, puc_perc, sslc_meta, puc_meta, admission_mode, competitive_ranking)
      VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, $6, $7)
      ON CONFLICT (student_id) DO UPDATE SET
        sslc_perc = EXCLUDED.sslc_perc, puc_perc = EXCLUDED.puc_perc,
        sslc_meta = EXCLUDED.sslc_meta, puc_meta = EXCLUDED.puc_meta,
        admission_mode = EXCLUDED.admission_mode, competitive_ranking = EXCLUDED.competitive_ranking
    `, [
      userId, sslc_perc || null, puc_perc || null,
      JSON.stringify(sslc_meta || {}), JSON.stringify(puc_meta || {}), 
      admission_mode || null, competitive_ranking || null
    ]);

    await pool.query(`
      UPDATE users 
      SET sub_tab_statuses = jsonb_set(COALESCE(sub_tab_statuses, '{}'::jsonb), '{schooling}', '"PENDING"') 
      WHERE id = $1
    `, [userId]);

    res.status(200).json({ message: "Schooling details saved successfully" });
  } catch (error) {
    next(error);
  }
};

export const getCurrentScores = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      "SELECT current_cgpa, sgpas, gap_info, active_backlogs, backlog_history FROM student_academics WHERE student_id = $1", 
      [userId]
    );
    const data = result.rows[0] || {};
    await sendResponseWithStatus(res, userId, data, 'current_scores');
  } catch (error) {
    next(error);
  }
};

export const saveCurrentScores = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { current_cgpa, sgpas, gap_info, active_backlogs, backlog_history } = req.body;
    
    await pool.query(`
      INSERT INTO student_academics (student_id, current_cgpa, sgpas, gap_info, active_backlogs, backlog_history)
      VALUES ($1, $2, $3::jsonb, $4::jsonb, $5, $6)
      ON CONFLICT (student_id) DO UPDATE SET
        current_cgpa = EXCLUDED.current_cgpa, sgpas = EXCLUDED.sgpas,
        gap_info = EXCLUDED.gap_info, active_backlogs = EXCLUDED.active_backlogs,
        backlog_history = EXCLUDED.backlog_history
    `, [
      userId, current_cgpa || null, 
      JSON.stringify(sgpas || {}), JSON.stringify(gap_info || {}), 
      active_backlogs || 0, backlog_history === 'true' || backlog_history === true
    ]);

    await pool.query(`
      UPDATE users 
      SET sub_tab_statuses = jsonb_set(COALESCE(sub_tab_statuses, '{}'::jsonb), '{current_scores}', '"PENDING"') 
      WHERE id = $1
    `, [userId]);

    res.status(200).json({ message: "Current scores saved successfully" });
  } catch (error) {
    next(error);
  }
};

export const getPreviousEdu = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      "SELECT ug_percentage, previous_edu_details, pg_specialization FROM student_academics WHERE student_id = $1", 
      [userId]
    );
    const data = result.rows[0] || {};
    await sendResponseWithStatus(res, userId, data, 'previous_edu');
  } catch (error) {
    next(error);
  }
};

export const savePreviousEdu = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { ug_percentage, previous_edu_details, pg_specialization } = req.body;
    
    await pool.query(`
      INSERT INTO student_academics (student_id, ug_percentage, previous_edu_details, pg_specialization)
      VALUES ($1, $2, $3::jsonb, $4)
      ON CONFLICT (student_id) DO UPDATE SET
        ug_percentage = EXCLUDED.ug_percentage, 
        previous_edu_details = EXCLUDED.previous_edu_details, 
        pg_specialization = EXCLUDED.pg_specialization
    `, [
      userId, ug_percentage || null, 
      JSON.stringify(previous_edu_details || {}), 
      pg_specialization || null
    ]);

    await pool.query(`
      UPDATE users 
      SET sub_tab_statuses = jsonb_set(COALESCE(sub_tab_statuses, '{}'::jsonb), '{previous_edu}', '"PENDING"') 
      WHERE id = $1
    `, [userId]);

    res.status(200).json({ message: "Previous education saved successfully" });
  } catch (error) {
    next(error);
  }
};

export const getDocument = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { docKey } = req.params;
    const result = await pool.query("SELECT documents FROM student_documents WHERE student_id = $1", [userId]);
    const documents = result.rows[0]?.documents || {};
    
    await sendResponseWithStatus(res, userId, { document_url: documents[docKey] || '' }, docKey);
  } catch (error) {
    next(error);
  }
};

export const saveDocument = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { docKey } = req.params;
    const { document_url } = req.body;
    
    await pool.query(`
      INSERT INTO student_documents (student_id, documents)
      VALUES ($1, jsonb_build_object($2::text, $3::text))
      ON CONFLICT (student_id) DO UPDATE SET
        documents = jsonb_set(student_documents.documents, ARRAY[$2::text], to_jsonb($3::text))
    `, [userId, docKey, document_url || '']);

    await pool.query(`
      UPDATE users 
      SET sub_tab_statuses = jsonb_set(COALESCE(sub_tab_statuses, '{}'::jsonb), ARRAY[$2::text], '"PENDING"') 
      WHERE id = $1
    `, [userId, docKey]);

    res.status(200).json({ message: "Document saved successfully" });
  } catch (error) {
    next(error);
  }
};

export const getOffersList = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await pool.query("SELECT id, company_name FROM student_offers WHERE student_id = $1 ORDER BY created_at ASC", [userId]);
    res.status(200).json({ data: result.rows });
  } catch (error) {
    next(error);
  }
};

export const createOffer = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(`
      INSERT INTO student_offers (student_id, company_name)
      VALUES ($1, 'New Job Offer')
      RETURNING id, company_name
    `, [userId]);
    
    const offerIdStr = `offer_${result.rows[0].id}`;
    await pool.query(`
      UPDATE users 
      SET sub_tab_statuses = jsonb_set(COALESCE(sub_tab_statuses, '{}'::jsonb), ARRAY[$2::text], '"INCOMPLETE"') 
      WHERE id = $1
    `, [userId, offerIdStr]);
    
    res.status(201).json({ message: "Offer block generated.", data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const getOffer = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM student_offers WHERE id = $1 AND student_id = $2", [id, userId]);

    if (result.rowCount === 0) return res.status(404).json({ message: "Offer not found." });
    
    const offerIdStr = `offer_${id}`;
    await sendResponseWithStatus(res, userId, result.rows[0], offerIdStr);
  } catch (error) {
    next(error);
  }
};

export const saveOffer = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { company_name, salary_lpa, offer_letter_url, is_accepted } = req.body;
    
    await pool.query(`
      UPDATE student_offers 
      SET company_name = $1, salary_lpa = $2, offer_letter_url = $3, is_accepted = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5 AND student_id = $6
    `, [
      company_name || 'New Job Offer', 
      salary_lpa || null, 
      offer_letter_url || '', 
      is_accepted === 'true' || is_accepted === true, 
      id, 
      userId
    ]);

    const offerIdStr = `offer_${id}`;
    await pool.query(`
      UPDATE users 
      SET sub_tab_statuses = jsonb_set(COALESCE(sub_tab_statuses, '{}'::jsonb), ARRAY[$2::text], '"PENDING"') 
      WHERE id = $1
    `, [userId, offerIdStr]);

    res.status(200).json({ message: "Offer saved successfully" });
  } catch (error) {
    next(error);
  }
};
