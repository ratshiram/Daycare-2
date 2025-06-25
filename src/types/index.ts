

export interface Base {
    id: string;
    created_at: string;
}

export interface Parent extends Base {
    user_id?: string | null;
    first_name: string;
    last_name: string;
    email: string;
    phone_number?: string | null;
    address_line1?: string | null;
    address_line2?: string | null;
    city?: string | null;
    province_state?: string | null;
    postal_code?: string | null;
    country?: string | null;
}

export interface Child extends Base {
    name: string;
    age: number | null;
    current_room_id?: string | null;
    primary_parent_id?: string | null;
    parent_2_id?: string | null;
    emergency_contact?: string | null;
    allergies?: string | null;
    notes?: string | null;
    medical_info?: any;
    authorized_pickups?: any[];
    billing?: any;
    check_in_time?: string | null;
    check_out_time?: string | null;
    primary_parent?: Parent | null; 
}

export interface Staff extends Base {
    user_id?: string | null;
    name: string;
    email: string;
    role: 'admin' | 'teacher' | 'assistant';
    contact_phone?: string | null;
    main_room_id?: string | null;
    qualifications?: string | null;
    emergency_contact_name?: string | null;
    emergency_contact_phone?: string | null;
    notes?: string | null;
}

export interface Room extends Base {
    name: string;
    capacity: number | null;
}

export interface DailyReport extends Base {
    child_id: string;
    staff_id: string;
    report_date: string;
    mood?: string | null;
    meals?: {
        breakfast?: string;
        lunch?: string;
        snack_am?: string;
        snack_pm?: string;
    } | null;
    naps?: {
        start?: string;
        end?: string;
    }[] | null;
    activities?: string | null;
    toileting_diapers?: string | null;
    supplies_needed?: string | null;
    notes_for_parents?: string | null;
    photo_url_1?: string | null;
    photo_url_2?: string | null;
    video_url_1?: string | null;
    video_url_2?: string | null;
}

export interface IncidentReport extends Base {
    child_id: string | null;
    reported_by_staff_id: string;
    incident_datetime: string;
    location?: string | null;
    description: string;
    actions_taken?: string | null;
    witnesses?: string | null;
    parent_notified?: boolean;
    parent_notification_datetime?: string | null;
    status?: 'Open' | 'Under Review' | 'Resolved';
    admin_follow_up_notes?: string | null;
}

export interface Medication extends Base {
    child_id: string;
    medication_name: string;
    dosage?: string | null;
    route?: string | null;
    frequency_instructions?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    notes_instructions?: string | null;
    requires_parent_authorization?: boolean;
    is_authorized_by_parent?: boolean;
    parent_authorization_datetime?: string | null;
    authorizing_parent_name?: string | null;
}

export interface MedicationLog extends Base {
    medication_id: string;
    child_id: string;
    administered_by_staff_id: string;
    administered_at: string;
    actual_dosage_given: string;
    notes?: string | null;
}

export interface Announcement extends Base {
    author_staff_id: string;
    title: string;
    content: string;
    publish_date: string;
    expiry_date?: string | null;
    category?: string | null;
    is_published?: boolean;
}

export interface Invoice extends Base {
    child_id: string;
    created_by_staff_id?: string | null;
    invoice_number: string;
    invoice_date: string;
    due_date?: string | null;
    amount_due: number;
    status?: 'Draft' | 'Unpaid' | 'Paid' | 'Overdue';
    items?: {
        description: string;
        amount: number;
    }[];
    notes_to_parent?: string | null;
}

export interface WaitlistEntry extends Base {
    child_name: string;
    child_dob?: string | null;
    parent_name: string;
    parent_email?: string | null;
    parent_phone?: string | null;
    requested_start_date?: string | null;
    notes?: string | null;
    status?: 'Pending' | 'Contacted' | 'Enrolled' | 'Withdrawn';
}

export interface StaffLeaveRequest extends Base {
    staff_id: string;
    start_date: string;
    end_date: string;
    leave_type?: string | null;
    reason?: string | null;
    status: 'pending' | 'approved' | 'denied';
    reviewed_by_admin_id?: string | null;
}

export interface Message extends Base {
    child_id: string;
    sender_user_id: string; // auth.users.id
    sender_name: string; // denormalized for display
    content: string;
}

export type AppState = {
  currentUser: any | null;
  appMode: string;
  children: Child[];
  staff: Staff[];
  rooms: Room[];
  dailyReports: DailyReport[];
  incidentReports: IncidentReport[];
  medications: Medication[];
  medicationLogs: MedicationLog[];
  announcements: Announcement[];
  invoices: Invoice[];
  waitlistEntries: WaitlistEntry[];
  parentsList: Parent[];
  staffLeaveRequests: StaffLeaveRequest[];
  messages: Message[];
  setCurrentPage: (page: string) => void;
  loadingData: Record<string, boolean>;
  showAlert: (message: string, type?: 'success' | 'error' | 'warning') => void;
  addMessageToSupabase: (childId: string, content: string) => Promise<void>;
};

    

    
