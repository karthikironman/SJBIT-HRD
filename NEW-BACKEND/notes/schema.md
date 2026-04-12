
# Sheet: all data
| description | student | enum1 | enum2 | enum3 | enum4 | enum5 | enum6 | enum7 | enum8 | enum9 | enum10 | enum11 | enum12 | enum13 | enum14 | enum15 | enum16 | enum17 | enum18 | enum19 | enum20 |
|  | personal_email |
| Write Full Name in CAPITAL letters with spaces between first name and last name and it must be as per 10th marks card | full_name |
|  | first_name |
|  | middle_name |
|  | last_name |
| Write Full USN in CAPITAL letters. (Ex 1JB22CS001) | usn |
| for calling | mobile_number |
|  | whatsapp_number |
|  | pursuing_degree | BE | MTech | MBA-SJBIT | MCA | MBA-B SCHOOL |
| Department/Specialization | department | CSE | ISE | ECE | EEE | MECH | CIVIL | CSE(DS) | AI & ML | MCA | HR | Finance | Marketing | Marketing & HR | Marketing & Finance | Digital Marketing | Business Analytics | Finance & HR | Marketing & Business Analytics | HR & Business Analytics | Finance & Business Analytics |
|  | year_of_joining |
|  | type_of_entry | Regular | Lateral |
|  | gender | Male | Female |
|  | date_of_birth |
|  | official_email |
|  | pan_number |
|  | aadhar_number |
| mentor or class teacher name | mentor_name |
| mentor or class teacher department | mentor_department | Placements | Basic Science | CSE | ISE | ECE | EEE | ME | CV | MBA | MCA | CSE(DS) | AI&ML |
| mentor or class teacher's mobile number | mentor_mobile_number |
|  | father_name |
|  | father_mobile_number |
|  | father_occupation |
|  | mother_name |
|  | mother_mobile_number |
|  | mother_occupation |
|  | communication_address |
|  | permanent_address |
|  | native_place |
|  | state |
|  | pin_code |
| Are you Interested in Campus Placements @ SJBIT? If YES then select one of the 1st 4 options starting with 'Y', else choose an option starting with 'N' | interested_placements | Y. Software/IT Job (Product, Platform, Communication, Service based industries) | Y. Core domain job | Y. Sales, Marketing, Business Development, Non-Technical Job | Y. Teaching/Research Job | Y. Core Finance | Y. HR Roles Only | Y. Finance / HR / Sales / Marketing | N. Own business/Entrepreneurship | N. Higher Studies | N. PSU Jobs thru GATE | N. Public Services like IAS/KAS | N. Other Govt. Jobs | N. Others |
|  | interested_higher_studies | Yes | No |
|  | sslc_percentage |
|  | sslc_yop |
|  | sslc_school_name |
|  | sslc_school_place |
|  | sslc_board |
|  | puc_percentage |
|  | puc_yop |
|  | puc_college_name |
|  | puc_college_place |
|  | puc_board |
|  | admission_mode | Through CET | Through COMED-K | Through PGCET | Through Diploma CET | MANAGEMENT | Others |
| cet/comed-k Rank | competitive_ranking |
|  | ug_pg | UG | PG |
| only if ug_pg == PG | pg_specialization | MARKETING / HR | MARKETING / FINANCE | CORE FINANCE | BUSINESS ANALYTICS | MARKETING | HR | COMPUTERS (MCA) | Finance & HR | Marketing & Business Analytics | HR &  Business Analytics | Finance & Business Analytics |
|  | ug_percentage |
|  | ug_degree | BE | BCA | B.Sc | B.Com | BA | BBA/BBM | Others |
| Ex. Computer Science, Arts, etc | ug_specialization |
|  | sem_1_sgpa_cgpa |
|  | sem_2_sgpa_cgpa |
|  | sem_3_sgpa_cgpa |
|  | sem_4_sgpa_cgpa |
|  | sem_5_sgpa_cgpa |
|  | sem_6_sgpa_cgpa |
|  | sem_7_sgpa_cgpa |
|  | sem_8_sgpa_cgpa |
|  | pursuing_degree_cgpa |
|  | current_active_backlogs |
|  | backlog_history |
|  | year_back |
| Number of years you had gap in your Academic career before current degree | year_gap_before_degree |
| Number of years you had gap in current degree | year_gap_current_degree |
| Traning Attendance - At |
| Training Score - TS |
| PX- Certificates |
| Opt-Out |  | Opt-in | Higher Studies |
|  | training_eligibility | Eligible | InEigible |
|  | academic_eligibility | Eligible | InEigible |
|  | overall_eligibility | Eligible | InEigible |
|  | status_of_approval | Approved | Rejected |
|  | document_status | Approved | Rejected |
|  | total_offers |
|  | total_offers_as_per_placement_policy |
|  | offer_1 |
|  | salary_1 |
|  | offer_2 |
|  | salary_2 |
|  | offer_3 |
|  | salary_3 |
|  | offer_4 |
|  | salary_4 |
|  |  max_salary |
|  | considered_salary |
|  | accepted_offer_type |
|  | current_placement_status |
|  | exited_after_2_offers | Yes | No |
|  | barred_from_process | Yes | No |
|  | resume_link |
|  | linkedin_link |
|  | github_link |
|  | internship_offer_letter |
|  | job_offer_letter_1_links |
|  | job_offer_letter_2_links |
|  | job_offer_letter_3_links |
|  | job_offer_letter_4_links |
|  | college_id_card_link |
|  | passport_size_photo_link |
|  | pan_card_link |
|  | aadhar_card_link |
|  | passport_link |
|  | sslc_marks_sheet_link |
|  | puc_diploma_marks_sheet_link |
|  | ug_marks_sheet_link |
| not for BE students | pg_marks_sheet_link |

# Sheet: db design
|  |  |  (Enum)  | user_role (Enum)  | status_type (Enum)  | edu_level (Enum)  | admission_mode (Enum)  | ug_degree_type (Enum)  | pg_spec_type (Enum)  | gender (Enum)  | document_type (Enum)  | department_branch (Enum)  | mentor_department (Enum)  | pursuing_degree (Enum)  |
|  |  |  | STUDENT | PENDING | UG | CET | BE | MARKETING_AND_HR | MALE | RESUME | CSE | CSE | BE |
|  |  |  | SPC | APPROVED | PG | COMED-K | BCA | MARKETING_AND_FINANCE | FEMALE | MARKS_CARD_10TH | ISE | ISE | MTECH |
|  |  |  | FPC | REJECTED |  | PGCET | BSC | CORE_FINANCE | OTHERS | MARKS_CARD_12TH | ECE | ECE | MBA |
|  |  |  | ADMIN |  |  | DIPLOMA_CET | BCOM | BUSINESS_ANALYTICS |  | UG_MARKS_CARD_ALL_SEM | EEE | EEE | MCA |
|  |  |  | PARENT |  |  | MANAGEMENT | BA | MARKETING |  | PG_MARKS_CARD_ALL_SEM | MECH | MECH |
|  |  |  | SUPER_USER |  |  | OTHERS | BBA | HR |  | PAN_CARD | CIVIL | CIVIL |
|  |  |  |  |  |  |  | BBM | COMPUTERS_MCA |  | AADHAAR_CARD | CSE_DS | CSE_DS |
|  |  |  |  |  |  |  | OTHERS | FINANCE_AND_HR |  | PASSPORT | AI_ML | AI_ML |
|  |  |  |  |  |  |  |  | MARKETING_AND_BUSINESS_ANALYTICS |  | PASSPORT_SIZE_PHOTO | MCA | MCA |
|  | SPC'S, FPC'S can access the records of their own department students only |  |  |  |  |  |  | HR_AND_BUSINESS_ANALYTICS |  | COLLEGE_ID_CARD | HR | MBA |
|  | IGNORE THE PARENT ROLE FOR NOW, THATS A DUMMY ROLE |  |  |  |  |  |  | FINANCE_AND_BUSINESS_ANALYTICS |  |  | FINANCE |
|  | ADMIN, SUPER_USER have ultimate access to any student from any department |  |  |  |  |  |  |  |  |  | MARKETING |
|  |  |  |  |  |  |  |  |  |  |  | MARKETING_HR |
|  |  |  |  |  |  |  |  |  |  |  | MARKETING_FINANCE |
| Write | Read |  |  |  |  |  |  |  |  |  | DIGITAL_MARKETING |
|  |  |  |  |  |  |  |  |  |  |  | BUSINESS_ANALYTICS |
|  |  |  | Users | Data Type |  |  |  |  |  |  | FINANCE_HR |
| SYSTEM | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER |  | id | UUID(PK) | Unique ID for the user. |  |  |  |  |  | MARKETING_BUSINESS_ANALYTICS |
| SELF | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER |  | email | VARCHAR(255) | Official/Personal email (Unique).  |  |  |  |  |  | HR_BUSINESS_ANALYTICS |
| SELF | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER |  | password_hash | TEXT | Encrypted password. |  |  |  |  |  | FINANCE_BUSINESS_ANALYTICS |
| SYSTEM | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER |  | role | user_role (Enum) |
| FPC, ADMIN, SUPER_USER | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER |  | is_active | BOOLEAN | To disable accounts if needed. |
| SELF | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER |  | profile_picture_url | TEXT |
| SYSTEM | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER |  | created_at | TIMESTAMP |
| SYSTEM | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER |  | updated_at | TIMESTAMP |
|  |  |  | Mentors | Data Type |
| SYSTEM | ALL |  | id | UUID(PK) | Unique ID. |
| FPC, ADMIN, SUPER_USER | ALL |  | user_id | UUID(FK) | Link to users if they have a login. |
| FPC, ADMIN, SUPER_USER | ALL |  | name | VARCHAR(255) | Mentor's full name. |
| FPC, ADMIN, SUPER_USER | ALL |  | department | mentor_department (Enum)  |
| FPC, ADMIN, SUPER_USER | ALL |  | mobile | VARCHAR(15) | Contact number. |
| SYSTEM | ALL |  | created_at | TIMESTAMP |
| SYSTEM | ALL |  | updated_at | TIMESTAMP |
|  |  |  | Students | Data Type |
| SYSTEM | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER |  | id | UUID (PK) | Unique student ID. |
| SYSTEM | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER |  | user_id | UUID (FK) | Link to users. |
| SELF | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER | Core Identity | usn | VARCHAR(20) | Unique Student Number (Unique index). |
| SELF | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER |  | full_name | VARCHAR(255) | TEXT GENERATED ALWAYS AS  (first_name || ' ' || COALESCE(middle_name || ' ', '') || last_name) STORED; |
| SELF | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER |  | first_name | VARCHAR(100) | Student's given name |
| SELF | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER |  | middle_name | VARCHAR(100) | Middle name (can be NULL) |
| SELF | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER |  | last_name | VARCHAR(100) | Surname/Family name |
| SELF | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER |  | department | department_branch (Enum)  | Branch of study. |
|  |  |  | pursuing_degree | pursuing_degree (Enum)  |
| SELF | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER |  | mobile_number | VARCHAR(15) | Primary calling number |
| SELF | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER |  | whatsapp_number | VARCHAR(15) | Whatsapp Number |
| SELF | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER |  | gender | gender (Enum)  |
| SELF | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER |  | dob | DATE |
| SELF | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER |  | mentor_id | UUID (FK) | Link to mentors. |
| SELF | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER |  | ug_pg | edu_level (Enum)  |
| SELF | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER | Personal Info | personal_info | JSONB | father_name father_mobile_number father_occupation mother_name mother_mobile_number mother_occupation communication_address permanent_address native_place state pin_code |
| SELF | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER | Official Documents | official_docs | JSONB | Stores {pan_number, aadhar_number}. |
| SELF, SPC, FPC, ADMIN, SUPER_USER | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER | verification | verification_status | status_type (Enum)  |
| SELF, SPC, FPC, ADMIN, SUPER_USER | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER |  | verified_by | UUID (FK) |
| SELF, SPC, FPC, ADMIN, SUPER_USER | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER |  | remarks | TEXT |
| SELF, SPC, FPC, ADMIN, SUPER_USER | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER |  | is_barred | BOOLEAN |
| SYSTEM | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER |  | created_at | TIMESTAMP |
| SYSTEM | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER |  | updated_at | TIMESTAMP |
|  |  |  | Academics | Data Type |
| SYSTEM | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER |  | student_id | UUID (PK/FK) | Links back to students. |
| SELF | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER | schooling | sslc_perc | NUMERIC(5,2) | 10th marks. |
| SELF | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER |  | puc_perc | NUMERIC(5,2) | 12th/Diploma marks. |
| SELF | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER |  | sslc_meta | JSONB | {school_name, yop, board} |
| SELF | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER |  | puc_meta | JSONB | {school_name, yop, board} |
| SELF | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER |  | admission_mode | admission_mode (Enum)  |
| SELF | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER |  | competitive_ranking | INT/VARCHAR |
| SELF | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER | Current Scores | current_cgpa | NUMERIC(4,2) | Updated aggregate. |
| SELF | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER |  | sgpas | JSONB | [8.5, 9.0, 7.2]   works for both mba and engineering |
| SELF | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER |  | gap_info | JSONB | {gap_before, gap_current, year_back} |
| SELF | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER |  | active_backlogs | INT | Active backlogs count. |
| SELF | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER |  | backlog_history | BOOLEAN |
| SELF | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER | If ug_pg is equal to pg    Previous Edu | ug_percentage | NUMERIC(5,2) |
| SELF | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER |  | previous_edu_details | JSONB | ug_degree (BE BCA B.Sc B.Com BA BBA/BBM Others), ug_specialization |
| SELF | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER |  | pg_specialization | pg_spec_type (Enum)  |
| SELF, SPC, FPC, ADMIN, SUPER_USER | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER | Verification | verification_status | status_type | APPROVED, REJECTED, PENDING. | need comment why rejected or approved..  |
| SELF, SPC, FPC, ADMIN, SUPER_USER | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER |  | verified_by | UUID (FK) |  | also we need audit trial of list of events |
| SELF, SPC, FPC, ADMIN, SUPER_USER | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER |  | remarks | TEXT |
| SYSTEM | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER |  | created_at | TIMESTAMP |
| SYSTEM | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER |  | updated_at | TIMESTAMP |
|  |  |  | Documents | Data Type |
| SYSTEM | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER |  | id | UUID (PK) |
| SYSTEM | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER |  | student_id | UUID (FK) |
| SELF | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER |  | doc_type | document_type |
| SELF | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER |  | file_url | TEXT |
| SELF, SPC, FPC, ADMIN, SUPER_USER | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER | Verification | verificiation_status | status_type (Enum)  |
| SELF, SPC, FPC, ADMIN, SUPER_USER | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER | Verification | verified_by | UUID (FK) |
| SELF, SPC, FPC, ADMIN, SUPER_USER | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER | Verification | remarks | TEXT |
| SYSTEM | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER |  | created_at | TIMESTAMP |
| SYSTEM | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER |  | updated_at | TIMESTAMP |
|  |  |  | Offers | Data Type |
| SYSTEM | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER |  | id | UUID (PK) |
| SYSTEM | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER |  | student_id | UUID (FK) | Link back to students |
| SELF | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER |  | company_name | VARCHAR(100) |
| SELF | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER |  | salary_lpa | NUMERIC(10,2) |
| SELF | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER |  | offer_letter_url | TEXT |
| SELF | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER |  | is_accepted | BOOLEAN |
| SELF, SPC, FPC, ADMIN, SUPER_USER | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER |  | verificiation_status | status_type (Enum)  |
| SELF, SPC, FPC, ADMIN, SUPER_USER | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER |  | verified_by | UUID (FK) |
| SELF, SPC, FPC, ADMIN, SUPER_USER | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER |  | remarks | TEXT |
| SYSTEM | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER |  | created_at | TIMESTAMP |
| SYSTEM | SELF, SPC, FPC, ADMIN, SELF_PARENT, SUPER_USER |  | updated_at | TIMESTAMP |
|  |  |  | audit_logs | Data Type |
| SELF, SPC, FPC, ADMIN, SUPER_USER | SYSTEM |  | id | UUID (PK) |
| SELF, SPC, FPC, ADMIN, SUPER_USER | SYSTEM |  | performed_by | UUID (FK to users) |
| SELF, SPC, FPC, ADMIN, SUPER_USER | SYSTEM |  | student_id | UUID (FK to students) |
| SELF, SPC, FPC, ADMIN, SUPER_USER | SYSTEM |  | action | TEXT (e.g., "TABLE_NAME_"+"STATUS") |
| SELF, SPC, FPC, ADMIN, SUPER_USER | SYSTEM |  | previous_value | JSONB (The data before change) |
| SELF, SPC, FPC, ADMIN, SUPER_USER | SYSTEM |  | new_value | JSONB (The data after change) |
| SELF, SPC, FPC, ADMIN, SUPER_USER | SYSTEM |  | timestamp | TIMESTAMP DEFAULT NOW() |
|  |  |  | Training Eligibility | Qualify min 85% attendance with average of all the training programs |
|  |  |  |  | Score 60% and above in training NQT assessment |
|  |  |  | Academic Eligibility | 60% in 10th, 60% in 12th, 6CGPA in eng with no active back logs |
|  |  |  | Overall Eligibility | Training && Academic |
