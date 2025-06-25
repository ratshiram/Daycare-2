
"use client";

import React, { useState, useEffect, createContext, useCallback, useContext } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Session, User } from '@supabase/supabase-js';

import { ErrorBoundary } from '../components/ErrorBoundary';

// Reusable Components
import { AuthPage } from '@/components/daycare/auth/AuthPage';
import { AdminDashboardPage } from '@/components/daycare/dashboards/AdminDashboard';
import { TeacherDashboardPage } from '@/components/daycare/dashboards/TeacherDashboard';
import { ParentDashboardPage } from '@/components/daycare/dashboards/ParentDashboard';
import { UnknownRolePage } from '@/components/daycare/dashboards/UnknownRole';
import { ChildrenPage } from '@/components/daycare/children/ChildrenPage';
import { AddChildModal } from '@/components/daycare/children/AddChildPage';
import { EditChildModal } from '@/components/daycare/children/EditChildModal';
import { StaffPage } from '@/components/daycare/staff/StaffPage';
import { AddStaffModal } from '@/components/daycare/staff/AddStaffPage';
import { EditStaffModal } from '@/components/daycare/staff/EditStaffModal';
import { AdminParentsPage } from '@/components/daycare/parents/AdminParentsPage';
import { AddParentModal } from '@/components/daycare/parents/AddParentPage';
import { EditParentModal } from '@/components/daycare/parents/EditParentModal';
import { RoomManagementPage } from '@/components/daycare/rooms/RoomManagementPage';
import { AddRoomModal } from '@/components/daycare/rooms/AddRoomPage';
import { EditRoomModal } from '@/components/daycare/rooms/EditRoomModal';
import { AdminDailyReportsPage } from '@/components/daycare/reports/AdminDailyReportsPage';
import { CreateOrEditDailyReportModal } from '@/components/daycare/reports/CreateDailyReportPage';
import { ViewDailyReportModal } from '@/components/daycare/reports/ViewDailyReportModal';
import { AdminIncidentReportsPage } from '@/components/daycare/incidents/AdminIncidentReportsPage';
import { LogIncidentModal } from '@/components/daycare/incidents/LogIncidentPage';
import { ViewIncidentDetailsModal } from '@/components/daycare/incidents/ViewIncidentDetailsModal';
import { ChildMedicationsPage } from '@/components/daycare/medications/ChildMedicationsPage';
import { AddMedicationModal } from '@/components/daycare/medications/AddMedicationModal';
import { EditMedicationModal } from '@/components/daycare/medications/EditMedicationModal';
import { LogMedicationAdministrationModal } from '@/components/daycare/medications/LogMedicationAdministrationModal';
import { AdminAnnouncementsPage } from '@/components/daycare/announcements/AdminAnnouncementsPage';
import { CreateAnnouncementPage } from '@/components/daycare/announcements/CreateAnnouncementPage';
import { AdminBillingPage } from '@/components/daycare/billing/AdminBillingPage';
import { CreateInvoiceModal } from '@/components/daycare/billing/CreateInvoicePage';
import { ViewInvoiceDetailsModal } from '@/components/daycare/billing/ViewInvoiceDetailsModal';
import { AdminWaitlistPage } from '@/components/daycare/waitlist/AdminWaitlistPage';
import { AddOrEditWaitlistModal } from '@/components/daycare/waitlist/AddToWaitlistPage';
import { AdminGalleryPage } from '@/components/daycare/gallery/AdminGalleryPage';
import { CommunicationsPage } from '@/components/daycare/communications/CommunicationsPage';
import { useToast } from '@/hooks/use-toast';
import type { Announcement, Child, DailyReport, IncidentReport, Invoice, Medication, MedicationLog, Parent, Room, Staff, WaitlistEntry, Message, AppState } from '@/types';
import Loading from './loading';
import { Icons } from '@/components/Icons';

type CurrentUser = User & { role: string; name: string; profileId: string | null; staff_id: string | null; };

// --- Contexts ---
const AppStateContext = createContext<AppState | null>(null);
export const useAppState = () => {
    const context = useContext(AppStateContext);
    if (!context) {
        throw new Error('useAppState must be used within an AppStateProvider');
    }
    return context;
};

const App = () => {
    const { toast } = useToast();
    const [session, setSession] = useState<Session | null>(null);
    const [appIsLoading, setAppIsLoading] = useState(true);
    const [authActionLoading, setAuthActionLoading] = useState(false);
    const [appMode, setAppMode] = useState('auth');
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
    const [currentPage, setCurrentPage] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 768) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true);
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Data states
    const [children, setChildren] = useState<Child[]>([]);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [dailyReports, setDailyReports] = useState<DailyReport[]>([]);
    const [incidentReports, setIncidentReports] = useState<IncidentReport[]>([]);
    const [medications, setMedications] = useState<Medication[]>([]);
    const [medicationLogs, setMedicationLogs] = useState<MedicationLog[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([]);
    const [parentsList, setParentsList] = useState<Parent[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);

    const [loadingData, setLoadingData] = useState<Record<string, boolean>>({});

    // Modal states & Edit states
    const [showAddChildModal, setShowAddChildModal] = useState(false);
    const [showEditChildModal, setShowEditChildModal] = useState(false);
    const [childToEdit, setChildToEdit] = useState<Child | null>(null);
    const [showAddStaffModal, setShowAddStaffModal] = useState(false);
    const [showEditStaffModal, setShowEditStaffModal] = useState(false);
    const [staffToEdit, setStaffToEdit] = useState<Staff | null>(null);
    const [showAddParentModal, setShowAddParentModal] = useState(false);
    const [showEditParentModal, setShowEditParentModal] = useState(false);
    const [parentToEdit, setParentToEdit] = useState<Parent | null>(null);
    const [showAddRoomModal, setShowAddRoomModal] = useState(false);
    const [showEditRoomModal, setShowEditRoomModal] = useState(false);
    const [roomToEdit, setRoomToEdit] = useState<Room | null>(null);
    const [showCreateReportModal, setShowCreateReportModal] = useState(false);
    const [showViewDailyReportModal, setShowViewDailyReportModal] = useState(false);
    const [reportToView, setReportToView] = useState<DailyReport | null>(null);
    const [reportToEdit, setReportToEdit] = useState<DailyReport | null>(null);
    const [showLogIncidentModal, setShowLogIncidentModal] = useState(false);
    const [showViewIncidentModal, setShowViewIncidentModal] = useState(false);
    const [incidentToView, setIncidentToView] = useState<IncidentReport | null>(null);
    const [childForMedications, setChildForMedications] = useState<Child | null>(null);
    const [showAddMedicationModal, setShowAddMedicationModal] = useState(false);
    const [showEditMedicationModal, setShowEditMedicationModal] = useState(false);
    const [medicationToEdit, setMedicationToEdit] = useState<Medication | null>(null);
    const [showLogMedicationModal, setShowLogMedicationModal] = useState(false);
    const [medicationToLog, setMedicationToLog] = useState<Medication | null>(null);
    const [announcementToEdit, setAnnouncementToEdit] = useState<Announcement | null>(null);
    const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);
    const [showViewInvoiceModal, setShowViewInvoiceModal] = useState(false);
    const [invoiceToView, setInvoiceToView] = useState<Invoice | null>(null);
    const [parentDetailsForInvoice, setParentDetailsForInvoice] = useState<Parent | null>(null);
    const [showAddWaitlistModal, setShowAddWaitlistModal] = useState(false);
    const [waitlistEntryToEdit, setWaitlistEntryToEdit] = useState<WaitlistEntry | null>(null);
    const [showCreateAnnouncementModal, setShowCreateAnnouncementModal] = useState(false);

    const showAlert = useCallback((message: string, type: 'success' | 'error' | 'warning' = 'success') => {
        toast({
            title: type.charAt(0).toUpperCase() + type.slice(1),
            description: message,
            variant: type === 'error' ? 'destructive' : 'default',
        });
    }, [toast]);
    
    // --- Centralized Data Loading Effect ---
    useEffect(() => {
        const fetchUserProfile = async (user: User) => {
            if (!user) return { role: 'unknown', name: 'User', profileId: null, staff_id: null };
            try {
                const { data: staffProfile, error: staffError } = await supabase.from('staff').select('id, name, role').eq('user_id', user.id).single();
                if (staffError && staffError.code !== 'PGRST116') console.error("Error fetching staff profile:", staffError);
                if (staffProfile) return { role: staffProfile.role.toLowerCase(), name: staffProfile.name, profileId: staffProfile.id, staff_id: staffProfile.id };

                const { data: parentProfile, error: parentError } = await supabase.from('parents').select('id, first_name, last_name').eq('user_id', user.id).single();
                if (parentError && parentError.code !== 'PGRST116') console.error("Error fetching parent profile:", parentError);
                if (parentProfile) return { role: 'parent', name: `${parentProfile.first_name || ''} ${parentProfile.last_name || ''}`.trim(), profileId: parentProfile.id, staff_id: null };

                return { role: 'unknown_profile', name: user.email || 'Unknown', profileId: null, staff_id: null };
            } catch (e) {
                console.error("Exception fetching user profile:", e);
                return { role: 'exception_profile', name: user.email || 'Unknown', profileId: null, staff_id: null };
            }
        };

        const fetchData = async (dataType: string, query: Promise<any>) => {
            setLoadingData(prev => ({...prev, [dataType]: true}));
            try {
              const { data, error } = await query;
              if (error) throw error;
              return data || [];
            } catch (e: any) { 
                showAlert(`Error fetching ${dataType}: ${e.message}`, 'error'); 
                return [];
            } finally { 
                setLoadingData(prev => ({...prev, [dataType]: false})); 
            }
        };

        const fetchAllDataForRole = async (role: string) => {
            try {
                const dataPromises: { [key: string]: Promise<any> } = {
                    rooms: fetchData('rooms', supabase.from('rooms').select('*').order('name', { ascending: true })),
                    announcements: fetchData('announcements', supabase.from('announcements').select('*').order('publish_date', { ascending: false })),
                    children: fetchData('children', supabase.from('children').select('*, primary_parent:primary_parent_id(id, first_name, last_name, email), secondary_parent:secondary_parent_id(id, first_name, last_name, email), check_in_time, check_out_time, current_room_id').order('name', { ascending: true })),
                    medications: fetchData('medications', supabase.from('medications').select('*').order('medication_name', { ascending: true })),
                    messages: fetchData('messages', supabase.from('messages').select('*').order('created_at', { ascending: true })),
                };
        
                if (['admin', 'teacher', 'assistant'].includes(role)) {
                    dataPromises.staff = fetchData('staff', supabase.from('staff').select('*').order('name', { ascending: true }));
                    dataPromises.dailyReports = fetchData('dailyReports', supabase.from('daily_reports').select('*').order('report_date', { ascending: false }));
                } else if (role === 'parent') {
                    dataPromises.dailyReports = fetchData('dailyReports', supabase.from('daily_reports').select('*').order('report_date', { ascending: false }));
                    dataPromises.invoices = fetchData('invoices', supabase.from('invoices').select('*').order('invoice_date', { ascending: false }));
                }
                
                if (role === 'admin') {
                    dataPromises.incidentReports = fetchData('incidentReports', supabase.from('incident_reports').select('*').order('incident_datetime', { ascending: false }));
                    dataPromises.medicationLogs = fetchData('medicationLogs', supabase.from('medication_logs').select('*').order('administered_at', { ascending: false }));
                    dataPromises.invoices = fetchData('invoices', supabase.from('invoices').select('*').order('invoice_date', { ascending: false }));
                    dataPromises.waitlistEntries = fetchData('waitlistEntries', supabase.from('waitlist_entries').select('*').order('created_at', { ascending: true }));
                    dataPromises.parentsList = fetchData('parentsList', supabase.from('parents').select('*').order('last_name', { ascending: true }));
                }
        
                const results = await Promise.all(Object.values(dataPromises));
                const keys = Object.keys(dataPromises);
                
                const setters: { [key: string]: React.Dispatch<React.SetStateAction<any>> } = {
                    rooms: setRooms, announcements: setAnnouncements, children: setChildren, medications: setMedications, messages: setMessages,
                    staff: setStaff, dailyReports: setDailyReports, invoices: setInvoices, incidentReports: setIncidentReports,
                    medicationLogs: setMedicationLogs, waitlistEntries: setWaitlistEntries, parentsList: setParentsList,
                };

                keys.forEach((key, index) => {
                    if (setters[key]) {
                        setters[key](results[index]);
                    }
                });

            } catch (e: any) {
                showAlert(`An error occurred while loading initial data: ${e.message}`, 'error');
            }
        };
        
        const processSessionChange = async (sessionData: Session | null) => {
            setAppIsLoading(true);
            try {
                setSession(sessionData);

                if (sessionData?.user) {
                    const userProfileDetails = await fetchUserProfile(sessionData.user);
                    setCurrentUser({ ...sessionData.user, ...userProfileDetails } as CurrentUser);
                    setAppMode(userProfileDetails.role);

                    let initialPage = '';
                    switch (userProfileDetails.role) {
                        case 'admin': initialPage = 'AdminDashboard'; break;
                        case 'teacher': initialPage = 'TeacherDashboard'; break;
                        case 'assistant': initialPage = 'AssistantDashboard'; break;
                        case 'parent': initialPage = 'ParentDashboard'; break;
                        default: initialPage = 'UnknownRolePage';
                    }
                    setCurrentPage(initialPage);
                    
                    await fetchAllDataForRole(userProfileDetails.role);

                } else {
                    setAppMode('auth');
                    setCurrentUser(null);
                    setChildren([]); setStaff([]); setRooms([]); setDailyReports([]);
                    setIncidentReports([]); setMedications([]); setMedicationLogs([]);
                    setAnnouncements([]); setInvoices([]); setWaitlistEntries([]);
                    setParentsList([]); setMessages([]);
                    setCurrentPage('');
                }
            } catch (error) {
                console.error("A critical error occurred during session processing:", error);
                showAlert("There was an error loading the application. Please try refreshing.", 'error');
                setAppMode('auth');
            } finally {
                setAppIsLoading(false);
            }
        };

        supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
            processSessionChange(initialSession);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sessionData) => {
            processSessionChange(sessionData);
        });

        return () => { subscription?.unsubscribe(); };
    }, [showAlert]);
    
    // Generic fetchData function used by CRUD operations below
    const fetchData = useCallback(async (dataType: string, setDataCallback: React.Dispatch<React.SetStateAction<any[]>>, query: Promise<any>) => {
        setLoadingData(prev => ({...prev, [dataType]: true}));
        try {
          const { data, error } = await query;
          if (error) throw error;
          setDataCallback(data || []);
        } catch (e: any) { showAlert(`Error fetching ${dataType}: ${e.message}`, 'error'); setDataCallback([]); }
        finally { setLoadingData(prev => ({...prev, [dataType]: false})); }
    }, [showAlert]);
    
    // --- ALL CRUD OPERATIONS ---
    const addChildToSupabase = useCallback(async (childFormData: Omit<Child, 'id' | 'created_at' | 'primary_parent' | 'secondary_parent'>) => {
        if (!childFormData.primary_parent_id) { showAlert("A primary parent must be selected.", "error"); return; }
        if (childFormData.current_room_id === '') childFormData.current_room_id = null;
        if (childFormData.secondary_parent_id === '') childFormData.secondary_parent_id = null;
        
        try { 
            const { data: newChild, error: childError } = await supabase.from('children').insert([childFormData]).select().single();
            if (childError || !newChild) throw childError || new Error("Failed to create child record.");
    
            showAlert('Child added successfully!'); 
            setShowAddChildModal(false);
            fetchData('children', setChildren, supabase.from('children').select('*, primary_parent:primary_parent_id(*), secondary_parent:secondary_parent_id(*), check_in_time, check_out_time, current_room_id').order('name', { ascending: true }));
        } catch (e: any) { showAlert(`Add child error: ${e.message}`, 'error'); }
    }, [showAlert, fetchData]);
    
    const handleOpenEditChildModal = useCallback((child: Child) => { setChildToEdit(child); setShowEditChildModal(true); }, []);
    
    const updateChildInSupabase = useCallback(async (updatedChildData: Child) => {
        if (!childToEdit?.id) return;
        if (!updatedChildData.primary_parent_id) { showAlert("A primary parent must be selected.", "error"); return; }
        
        try { 
            const { id, primary_parent, secondary_parent, ...dataToUpdate } = updatedChildData;
            if ('current_room_id' in dataToUpdate && dataToUpdate.current_room_id === '') {
                (dataToUpdate as any).current_room_id = null;
            }
             if ('secondary_parent_id' in dataToUpdate && dataToUpdate.secondary_parent_id === '') {
                (dataToUpdate as any).secondary_parent_id = null;
            }
            const { error: childUpdateError } = await supabase.from('children').update(dataToUpdate).eq('id', childToEdit.id); 
            if (childUpdateError) throw childUpdateError; 

            showAlert('Child updated!'); 
            setShowEditChildModal(false); 
            setChildToEdit(null);
            fetchData('children', setChildren, supabase.from('children').select('*, primary_parent:primary_parent_id(*), secondary_parent:secondary_parent_id(*), check_in_time, check_out_time, current_room_id').order('name', { ascending: true }));
        } catch(e: any){ showAlert(`Update child error: ${e.message}`,'error'); }
    }, [showAlert, childToEdit, fetchData]);
    
    const deleteChildFromSupabase = useCallback(async (childId: string) => { 
        if (!window.confirm("Are you sure you want to delete this child? This action cannot be undone.")) return; 
        try {
            const {error}=await supabase.from('children').delete().eq('id', childId); 
            if(error) throw error; 
            showAlert('Child deleted!');
            fetchData('children', setChildren, supabase.from('children').select('*, primary_parent:primary_parent_id(*), secondary_parent:secondary_parent_id(*), check_in_time, check_out_time, current_room_id').order('name', { ascending: true }));
        }catch(e: any){showAlert(`Delete child error: ${e.message}`,'error');}
    }, [showAlert, fetchData]);

    const toggleChildCheckInStatus = useCallback(async (childId: string) => { 
        const child = children.find(c=>c.id===childId); 
        if(!child) return; 
        const now = new Date().toISOString(); 
        const wasCheckedIn = child.check_in_time && !child.check_out_time; 
        const updates = {check_in_time: wasCheckedIn ? child.check_in_time : now, check_out_time: wasCheckedIn ? now : null}; 
        try {const {error}=await supabase.from('children').update(updates).eq('id', childId); if(error) throw error; showAlert(`Child ${wasCheckedIn?'checked out':'checked in'} successfully!`); fetchData('children', setChildren, supabase.from('children').select('*, primary_parent:primary_parent_id(*), secondary_parent:secondary_parent_id(*), check_in_time, check_out_time, current_room_id').order('name', { ascending: true }));
        }catch(e: any){showAlert(`Check-in/out error: ${e.message}`,'error');}
    }, [showAlert, children, fetchData]);
      
    const addStaffToSupabase = useCallback(async (staffData: Omit<Staff, 'id'| 'created_at'>) => {
        try {
            const { data: existingStaff } = await supabase.from('staff').select('id, email').eq('email', staffData.email).single();
            if (existingStaff) { showAlert(`Staff with email ${staffData.email} already exists.`, 'warning'); return; }
    
            const dataToInsert: any = {...staffData};
            dataToInsert.role = dataToInsert.role?.toLowerCase(); 
            if (dataToInsert.role !== 'teacher') {
                dataToInsert.main_room_id = null;
            } else if (!dataToInsert.main_room_id || dataToInsert.main_room_id === '') {
                dataToInsert.main_room_id = null; 
            }
            
            if (currentUser && dataToInsert.email === currentUser.email) {
                dataToInsert.user_id = currentUser.id;
            } else {
                dataToInsert.user_id = null;
            }

            const {error}=await supabase.from('staff').insert([dataToInsert]);
            if(error) throw error;
            showAlert('Staff added!'); 
            setShowAddStaffModal(false);
            fetchData('staff', setStaff, supabase.from('staff').select('*').order('name', { ascending: true }));
        } catch(e: any){ showAlert(`Add staff error: ${e.message}`,'error'); }
    }, [showAlert, currentUser, fetchData]);

    const handleOpenEditStaffModal = useCallback((staffMember: Staff) => { setStaffToEdit(staffMember); setShowEditStaffModal(true); }, []);
    
    const updateStaffInSupabase = useCallback(async (updatedStaffData: Staff) => {
        if (!staffToEdit?.id) return;
        try {
            const { id, ...dataToUpdate }: any = updatedStaffData;
            dataToUpdate.role = dataToUpdate.role?.toLowerCase();
            if (dataToUpdate.role !== 'teacher') dataToUpdate.main_room_id = null;
            else if (dataToUpdate.main_room_id === '' || dataToUpdate.main_room_id === undefined) dataToUpdate.main_room_id = null;
            const { error } = await supabase.from('staff').update(dataToUpdate).eq('id', staffToEdit.id);
            if (error) throw error;
            showAlert('Staff member updated successfully!'); 
            setShowEditStaffModal(false); 
            setStaffToEdit(null);
            fetchData('staff', setStaff, supabase.from('staff').select('*').order('name', { ascending: true }));
        } catch (e: any) { showAlert(`Error updating staff member: ${e.message}`, 'error'); }
    }, [showAlert, staffToEdit, fetchData]);

    const deleteStaffFromSupabase = useCallback(async (staffId: string) => { 
        if (!window.confirm("Are you sure you want to delete this staff member?")) return; 
        try { 
            const { error } = await supabase.from('staff').delete().eq('id', staffId); 
            if (error) throw error; 
            showAlert('Staff member deleted!'); 
            fetchData('staff', setStaff, supabase.from('staff').select('*').order('name', { ascending: true }));
        } catch (e: any) { showAlert(`Delete staff error: ${e.message}`, 'error');}
    }, [showAlert, fetchData]);
    
    const addRoomToSupabase = useCallback(async (roomData: Omit<Room, 'id' | 'created_at'>) => { 
        try {
            const {error} = await supabase.from('rooms').insert([roomData]); 
            if(error) throw error; 
            showAlert('Room added!'); 
            setShowAddRoomModal(false);
            fetchData('rooms', setRooms, supabase.from('rooms').select('*').order('name', { ascending: true }));
        } catch(e: any){showAlert(`Add room error: ${e.message}`,'error');}
    }, [showAlert, fetchData]);

    const handleOpenEditRoomModal = useCallback((room: Room) => { setRoomToEdit(room); setShowEditRoomModal(true); }, []);

    const updateRoomInSupabase = useCallback(async (updatedRoomData: Room) => { 
        if (!roomToEdit?.id) return; 
        try { 
            const { id, ...dataToUpdate } = updatedRoomData; 
            const { error } = await supabase.from('rooms').update(dataToUpdate).eq('id', roomToEdit.id); 
            if (error) throw error; 
            showAlert('Room updated!'); 
            setShowEditRoomModal(false); 
            setRoomToEdit(null); 
            fetchData('rooms', setRooms, supabase.from('rooms').select('*').order('name', { ascending: true }));
        } catch (e: any) { showAlert(`Update room error: ${e.message}`, 'error');}
    }, [showAlert, roomToEdit, fetchData]);
    
    const deleteRoomFromSupabase = useCallback(async (roomId: string) => { 
        if (!window.confirm("Are you sure you want to delete this room?")) return; 
        try { 
            const { error } = await supabase.from('rooms').delete().eq('id', roomId); 
            if (error) throw error; 
            showAlert('Room deleted!'); 
            fetchData('rooms', setRooms, supabase.from('rooms').select('*').order('name', { ascending: true }));
        } catch (e: any) { showAlert(`Delete room error: ${e.message}`, 'error');}
    }, [showAlert, fetchData]);

    const addDailyReportToSupabase = useCallback(async (reportData: Omit<DailyReport, 'id' | 'created_at'>) => {
        if (!currentUser?.staff_id) { showAlert("Cannot create report: Staff profile not loaded.", "error"); return; }
        const dataWithStaffId = { ...reportData, staff_id: currentUser.staff_id };
        try { 
            const { error } = await supabase.from('daily_reports').insert([dataWithStaffId]); 
            if (error) throw error; 
            showAlert('Daily report added!'); 
            setShowCreateReportModal(false);
            fetchData('dailyReports', setDailyReports, supabase.from('daily_reports').select('*').order('report_date', { ascending: false }));
        } catch (e: any) { showAlert(`Error adding daily report: ${e.message}`, 'error'); }
    }, [showAlert, currentUser, fetchData]);
    
    const handleViewReportDetails = useCallback((report: DailyReport) => { setReportToView(report); setShowViewDailyReportModal(true); }, []);
    
    const handleEditReport = useCallback((report: DailyReport) => { setReportToEdit(report); setShowCreateReportModal(true); }, []);

    const updateDailyReportInSupabase = useCallback(async (reportData: DailyReport) => {
        if (!reportToEdit?.id) return;
        try {
            const { id, ...dataToUpdate } = reportData;
            const { error } = await supabase.from('daily_reports').update(dataToUpdate).eq('id', reportToEdit.id);
            if (error) throw error;
            showAlert('Daily report updated successfully!');
            setShowCreateReportModal(false);
            setReportToEdit(null);
            fetchData('dailyReports', setDailyReports, supabase.from('daily_reports').select('*').order('report_date', { ascending: false }));
        } catch (e: any) {
            showAlert(`Error updating daily report: ${e.message}`, 'error');
        }
    }, [showAlert, reportToEdit, fetchData]);

    const addIncidentReportToSupabase = useCallback(async (incidentData: Omit<IncidentReport, 'id' | 'created_at'>) => {
        if (!currentUser?.staff_id) { showAlert("Cannot log incident: Staff profile not loaded.", "error"); return; }
        const dataWithStaffId = { ...incidentData, reported_by_staff_id: currentUser.staff_id };
        try { 
            const { error } = await supabase.from('incident_reports').insert([dataWithStaffId]); 
            if (error) throw error; 
            showAlert('Incident report logged!'); 
            setShowLogIncidentModal(false);
            fetchData('incidentReports', setIncidentReports, supabase.from('incident_reports').select('*').order('incident_datetime', { ascending: false }));
        } catch (e: any) { showAlert(`Log incident error: ${e.message}`, 'error'); }
    }, [showAlert, currentUser, fetchData]);
    
    const handleViewIncidentDetails = useCallback((incident: IncidentReport) => { setIncidentToView(incident); setShowViewIncidentModal(true); }, []);
    
    const handleNavigateToChildMedications = useCallback((child: Child) => { setChildForMedications(child); setCurrentPage('ChildMedicationsPage'); }, []);
    const handleOpenAddMedicationModal = useCallback((childId: string) => { setChildForMedications(children.find(c => c.id === childId) || childForMedications); setShowAddMedicationModal(true); }, [children, childForMedications]);
    const handleOpenEditMedicationModal = useCallback((medication: Medication) => { setMedicationToEdit(medication); setShowEditMedicationModal(true); }, []);
    const handleOpenLogAdministrationModal = useCallback((medication: Medication) => { setMedicationToLog(medication); setShowLogMedicationModal(true); }, []);

    const addMedicationToSupabase = useCallback(async (medData: Omit<Medication, 'id' | 'created_at'>) => { 
        try { 
            const { error } = await supabase.from('medications').insert([medData]); 
            if (error) throw error; 
            showAlert('Medication added!'); 
            setShowAddMedicationModal(false);
            fetchData('medications', setMedications, supabase.from('medications').select('*').order('medication_name', { ascending: true }));
        } catch (e: any) { 
            showAlert(`Add medication error: ${e.message}`, 'error'); 
        } 
    }, [showAlert, fetchData]);

    const updateMedicationInSupabase = useCallback(async (medData: Medication) => { 
        if (!medData.id) return; 
        try { 
            const {id, ...dataToUpdate} = medData; 
            const { error } = await supabase.from('medications').update(dataToUpdate).eq('id', id); 
            if (error) throw error; 
            showAlert('Medication updated!'); 
            setShowEditMedicationModal(false); 
            setMedicationToEdit(null);
            fetchData('medications', setMedications, supabase.from('medications').select('*').order('medication_name', { ascending: true }));
        } catch (e: any) { 
            showAlert(`Update medication error: ${e.message}`, 'error');
        } 
    }, [showAlert, fetchData]);

    const deleteMedicationFromSupabase = useCallback(async (medicationId: string) => { 
        if (!window.confirm("Delete medication?")) return; 
        try { 
            const { error } = await supabase.from('medications').delete().eq('id', medicationId); 
            if (error) throw error; 
            showAlert('Medication deleted!'); 
            fetchData('medications', setMedications, supabase.from('medications').select('*').order('medication_name', { ascending: true }));
        } catch (e: any) { 
            showAlert(`Delete medication error: ${e.message}`, 'error'); 
        } 
    }, [showAlert, fetchData]);
    
    const addMedicationLogToSupabase = useCallback(async (logData: Omit<MedicationLog, 'id' | 'created_at' | 'administered_by_staff_id'>) => {
        if (!currentUser?.staff_id) { showAlert("Cannot log medication: Staff profile not loaded.", "error"); return; }
        const dataWithStaffId = { ...logData, administered_by_staff_id: currentUser.staff_id };
        try { 
            const { error } = await supabase.from('medication_logs').insert([dataWithStaffId]); 
            if (error) throw error; 
            showAlert('Medication administration logged!'); 
            setShowLogMedicationModal(false); 
            setMedicationToLog(null);
            fetchData('medicationLogs', setMedicationLogs, supabase.from('medication_logs').select('*').order('administered_at', { ascending: false }));
        } catch (e: any) { 
            showAlert(`Log med admin error: ${e.message}`, 'error');
        }
    }, [showAlert, currentUser, fetchData]);
    
    const addAnnouncementToSupabase = useCallback(async (announcementData: Omit<Announcement, 'id' | 'created_at'>) => {
        if (!currentUser?.staff_id) { showAlert("Cannot create announcement: Staff profile not loaded.", "error"); return; }
        const dataWithStaffId = { ...announcementData, author_staff_id: currentUser.staff_id };
        try { 
            const { error } = await supabase.from('announcements').insert([dataWithStaffId]); 
            if (error) throw error; 
            showAlert('Announcement created!'); 
            setShowCreateAnnouncementModal(false);
            fetchData('announcements', setAnnouncements, supabase.from('announcements').select('*').order('publish_date', { ascending: false }));
        } catch (e: any) { 
            showAlert(`Create announcement error: ${e.message}`, 'error'); 
        }
    }, [showAlert, currentUser, fetchData]);
    
    const updateAnnouncementInSupabase = useCallback(async (announcementData: Announcement) => {
        if (!announcementData.id || !currentUser?.staff_id) return;
        const {id, ...dataToUpdate} = announcementData;
        const dataWithStaffId = { ...dataToUpdate, author_staff_id: currentUser.staff_id };
        try { 
            const { error } = await supabase.from('announcements').update(dataWithStaffId).eq('id', id); 
            if (error) throw error; 
            showAlert('Announcement updated!'); 
            setShowCreateAnnouncementModal(false); 
            setAnnouncementToEdit(null);
            fetchData('announcements', setAnnouncements, supabase.from('announcements').select('*').order('publish_date', { ascending: false }));
        } catch (e: any) { 
            showAlert(`Update announcement error: ${e.message}`, 'error'); 
        }
    }, [showAlert, currentUser, fetchData]);
    
    const deleteAnnouncementFromSupabase = useCallback(async (announcementId: string) => { 
        if (!window.confirm("Delete announcement?")) return; 
        try { 
            const { error } = await supabase.from('announcements').delete().eq('id', announcementId); 
            if (error) throw error; 
            showAlert('Announcement deleted!'); 
            fetchData('announcements', setAnnouncements, supabase.from('announcements').select('*').order('publish_date', { ascending: false }));
        } catch (e: any) { 
            showAlert(`Delete announcement error: ${e.message}`, 'error'); 
        } 
    }, [showAlert, fetchData]);
    
    const addInvoiceToSupabase = useCallback(async (invoiceData: Omit<Invoice, 'id' | 'created_at'>) => {
        let dataWithCreator: any = { ...invoiceData };
        if (currentUser && ['admin', 'teacher', 'assistant'].includes(currentUser.role) && currentUser.staff_id) {
            dataWithCreator.created_by_staff_id = currentUser.staff_id;
        }
        try { 
            const { error } = await supabase.from('invoices').insert([dataWithCreator]); 
            if (error) throw error; 
            showAlert('Invoice created!'); 
            setShowCreateInvoiceModal(false);
            fetchData('invoices', setInvoices, supabase.from('invoices').select('*').order('invoice_date', { ascending: false }));
        } catch (e: any) { 
            showAlert(`Create invoice error: ${e.message}`, 'error'); 
        }
    }, [showAlert, currentUser, fetchData]);

    const handleViewInvoiceDetails = useCallback(async (invoice: Invoice) => {
        setInvoiceToView(invoice);
        const childForInvoice = children.find(c => c.id === invoice.child_id);
        if (childForInvoice && childForInvoice.primary_parent) {
            setParentDetailsForInvoice(childForInvoice.primary_parent);
        } else if (childForInvoice?.primary_parent_id) {
            setLoadingData(prev => ({...prev, parentForInvoice: true}));
            const { data: parent } = await supabase.from('parents').select('*').eq('id', childForInvoice.primary_parent_id).single();
            setParentDetailsForInvoice(parent);
            setLoadingData(prev => ({...prev, parentForInvoice: false}));
        } else {
            setParentDetailsForInvoice(null);
        }
        setShowViewInvoiceModal(true);
    }, [children]);

    const handleOpenAddWaitlistModal = useCallback(() => { setWaitlistEntryToEdit(null); setShowAddWaitlistModal(true); }, []);
    const handleEditWaitlistEntry = useCallback((entry: WaitlistEntry) => { setWaitlistEntryToEdit(entry); setShowAddWaitlistModal(true); }, []);
    
    const addOrUpdateWaitlistEntryToSupabase = useCallback(async (entryData: WaitlistEntry, isEditing: boolean) => { 
        try { 
            let error; 
            if (isEditing) { 
                const {id, ...dataToUpdate} = entryData; 
                ({ error } = await supabase.from('waitlist_entries').update(dataToUpdate).eq('id', id)); 
            } else { 
                const {id, ...dataToInsert} = entryData; 
                ({ error } = await supabase.from('waitlist_entries').insert([dataToInsert])); 
            } 
            if (error) throw error; 
            showAlert(`Waitlist entry ${isEditing ? 'updated' : 'added'}!`); 
            setShowAddWaitlistModal(false); 
            setWaitlistEntryToEdit(null);
            fetchData('waitlistEntries', setWaitlistEntries, supabase.from('waitlist_entries').select('*').order('created_at', { ascending: true }));
        } catch (e: any) { 
            showAlert(`Waitlist error: ${e.message}`, 'error'); 
        } 
    }, [showAlert, fetchData]);
    
    const deleteWaitlistEntryFromSupabase = useCallback(async (entryId: string) => { 
        if (!window.confirm("Remove from waitlist?")) return; 
        try { 
            const { error } = await supabase.from('waitlist_entries').delete().eq('id', entryId); 
            if (error) throw error; 
            showAlert('Waitlist entry removed!'); 
            fetchData('waitlistEntries', setWaitlistEntries, supabase.from('waitlist_entries').select('*').order('created_at', { ascending: true }));
        } catch (e: any) { 
            showAlert(`Delete waitlist entry error: ${e.message}`, 'error'); 
        } 
    }, [showAlert, fetchData]);
    
    const addParentToSupabase = useCallback(async (parentData: Omit<Parent, 'id' | 'created_at'>) => {
        try {
            const { data: existingParent } = await supabase.from('parents').select('id, email').eq('email', parentData.email).single();
            if (existingParent) { showAlert(`Parent with email ${parentData.email} already exists.`, 'warning'); return; }
            const { error } = await supabase.from('parents').insert([parentData]);
            if (error) throw error;
            showAlert('Parent added successfully!'); 
            setShowAddParentModal(false);
            fetchData('parentsList', setParentsList, supabase.from('parents').select('*').order('last_name', { ascending: true }));
        } catch (e: any) { showAlert(`Error adding parent: ${e.message}`, 'error'); }
    }, [showAlert, fetchData]);
    
    const handleOpenEditParentModal = useCallback((parent: Parent) => { setParentToEdit(parent); setShowEditParentModal(true); }, []);

    const updateParentInSupabase = useCallback(async (updatedParentData: Parent) => {
        if (!parentToEdit?.id) return;
        try { 
            const { id, ...dataToUpdate } = updatedParentData; 
            const { error } = await supabase.from('parents').update(dataToUpdate).eq('id', id); 
            if (error) throw error; 
            showAlert('Parent details updated!'); 
            setShowEditParentModal(false); 
            setParentToEdit(null);
            fetchData('parentsList', setParentsList, supabase.from('parents').select('*').order('last_name', { ascending: true }));
        } catch (e: any) { 
            showAlert(`Error updating parent: ${e.message}`, 'error'); 
        }
    }, [showAlert, parentToEdit, fetchData]);
    
    const deleteParentFromSupabase = useCallback(async (parentId: string) => {
        if (!window.confirm("Delete parent? This may affect linked children.")) return;
        try {
            const { data: linkedChildren, error: childrenCheckError } = await supabase.from('children').select('id').or(`primary_parent_id.eq.${parentId},secondary_parent_id.eq.${parentId}`);
            if (childrenCheckError) { showAlert(`Error checking linked children: ${childrenCheckError.message}`, 'error'); return; }
            if (linkedChildren && linkedChildren.length > 0) { showAlert(`Parent is linked to ${linkedChildren.length} child(ren). Reassign primary or secondary parent first.`, 'error'); return; }
            const { error } = await supabase.from('parents').delete().eq('id', parentId);
            if (error) throw error; 
            showAlert('Parent deleted successfully!');
            fetchData('parentsList', setParentsList, supabase.from('parents').select('*').order('last_name', { ascending: true }));
        } catch (e: any) { 
            showAlert(`Error deleting parent: ${e.message}`, 'error'); 
        }
    }, [showAlert, fetchData]);

    const addMessageToSupabase = useCallback(async (childId: string, content: string) => {
        if (!currentUser?.id || !currentUser.name || !content.trim()) {
            showAlert("Cannot send message: missing user info or empty content.", "error");
            return;
        }
        const messageData = {
            child_id: childId,
            sender_user_id: currentUser.id,
            sender_name: currentUser.name,
            content: content.trim(),
        };
        try {
            const { error } = await supabase.from('messages').insert([messageData]);
            if (error) throw error;
            fetchData('messages', setMessages, supabase.from('messages').select('*').order('created_at', { ascending: true }));
        } catch (e: any) {
            showAlert(`Error sending message: ${e.message}`, 'error');
        }
    }, [currentUser, showAlert, fetchData]);
    
    // Auth Handlers
    const handleSignUp = async (email: string, password: string) => {
        setAuthActionLoading(true);
        try { const { error } = await supabase.auth.signUp({ email, password }); if (error) throw error; showAlert('Signup successful! Please check your email to confirm.');
        } catch (e: any) { showAlert(`Signup error: ${e.message}`, 'error');
        } finally { setAuthActionLoading(false); }
    };

    const handleSignIn = async (email: string, password: string) => {
        setAuthActionLoading(true);
        try { const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) throw error; } catch (e: any) { showAlert(`Signin error: ${e.message}`, 'error');
        } finally { setAuthActionLoading(false); }
    };
    
    const handleSignOut = async () => {
        setAuthActionLoading(true);
        const { error } = await supabase.auth.signOut();
        if (error) showAlert(`Signout error: ${error.message}`, 'error');
        setAuthActionLoading(false);
    };

    // Navigation definitions
    const adminNav = [ { name: 'AdminDashboard', label: 'Dashboard', icon: Icons.HomeIcon }, { name: 'Children', label: 'Children', icon: Icons.Smile }, { name: 'Staff', label: 'Staff', icon: Icons.UsersIconAliased }, { name: 'AdminParents', label: 'Parents', icon: Icons.UserCog }, { name: 'Rooms', label: 'Rooms', icon: Icons.Building }, { name: 'AdminDailyReports', label: 'Daily Reports', icon: Icons.FileText }, { name: 'AdminIncidentReports', label: 'Incident Reports', icon: Icons.ShieldAlert }, { name: 'Communications', label: 'Communications', icon: Icons.MessageSquare }, { name: 'AdminGallery', label: 'Gallery', icon: Icons.Camera }, { name: 'AdminAnnouncements', label: 'Announcements', icon: Icons.Megaphone }, { name: 'AdminBilling', label: 'Billing', icon: Icons.DollarSign }, { name: 'AdminWaitlist', label: 'Waitlist', icon: Icons.ListOrdered }, ];
    const teacherNav = [ { name: 'TeacherDashboard', label: 'Dashboard', icon: Icons.HomeIcon }, { name: 'Children', label: 'Children', icon: Icons.Smile }, { name: 'AdminDailyReports', label: 'Daily Reports', icon: Icons.FileText }, { name: 'Communications', label: 'Communications', icon: Icons.MessageSquare }, { name: 'AdminGallery', label: 'Gallery', icon: Icons.Camera }, { name: 'AdminAnnouncements', label: 'Announcements', icon: Icons.Megaphone } ];
    const assistantNav = [ { name: 'AssistantDashboard', label: 'Dashboard', icon: Icons.HomeIcon }, { name: 'AdminDailyReports', label: 'Create Report', icon: Icons.FileText }, { name: 'AdminGallery', label: 'Gallery', icon: Icons.Camera } ];
    const parentNav = [ { name: 'ParentDashboard', label: 'Dashboard', icon: Icons.HomeIcon }, { name: 'ParentDailyReports', label: 'Daily Reports', icon: Icons.FileText }, { name: 'ParentMedications', label: 'Medications', icon: Icons.Pill }, { name: 'Communications', label: 'Communications', icon: Icons.MessageSquare }, { name: 'ParentInvoices', label: 'Invoices', icon: Icons.DollarSign }, { name: 'AdminGallery', label: 'Photo Gallery', icon: Icons.Camera }, { name: 'AdminAnnouncements', label: 'Announcements', icon: Icons.Megaphone } ];
    let currentNavItems = []; let currentPortalName = "Daycare Portal";
    switch (appMode) { case 'admin': currentNavItems = adminNav; currentPortalName = "Admin Portal"; break; case 'teacher': currentNavItems = teacherNav; currentPortalName = "Teacher Portal"; break; case 'assistant': currentNavItems = assistantNav; currentPortalName = "Assistant Portal"; break; case 'parent': currentNavItems = parentNav; currentPortalName = "Parent Portal"; break; default: currentNavItems = []; currentPortalName = "Welcome"; }
    
    const handleOpenCreateAnnouncementModal = () => { setAnnouncementToEdit(null); setShowCreateAnnouncementModal(true); };
    const handleEditAnnouncement = (announcement: Announcement) => { setAnnouncementToEdit(announcement); setShowCreateAnnouncementModal(true); };

    // --- renderCurrentPage function ---
    const renderCurrentPage = () => {
        const pageToRender = childForMedications ? 'ChildMedicationsPage' : currentPage;
        
        switch (appMode) {
            case 'admin':
                switch (pageToRender) {
                    case 'AdminDashboard': return <AdminDashboardPage />;
                    case 'Children': return <ChildrenPage childrenList={children} loading={loadingData.children || false} onOpenAddChildModal={() => setShowAddChildModal(true)} onEditChild={handleOpenEditChildModal} onDeleteChild={deleteChildFromSupabase} onToggleCheckIn={toggleChildCheckInStatus} onNavigateToChildMedications={handleNavigateToChildMedications} />;
                    case 'Staff': return <StaffPage staffList={staff} loading={loadingData.staff || false} onOpenAddStaffModal={() => setShowAddStaffModal(true)} onEditStaff={handleOpenEditStaffModal} onDeleteStaff={deleteStaffFromSupabase} rooms={rooms} />;
                    case 'AdminParents': return <AdminParentsPage parentsList={parentsList} loading={loadingData.parentsList || false} onOpenAddParentModal={() => setShowAddParentModal(true)} onEditParent={handleOpenEditParentModal} onDeleteParent={deleteParentFromSupabase} />;
                    case 'Rooms': return <RoomManagementPage rooms={rooms} loading={loadingData.rooms || false} onOpenAddRoomModal={() => setShowAddRoomModal(true)} onEditRoom={handleOpenEditRoomModal} onDeleteRoom={deleteRoomFromSupabase} />;
                    case 'AdminDailyReports': return <AdminDailyReportsPage dailyReports={dailyReports} children={children} staff={staff} loading={loadingData.dailyReports || false} onOpenCreateReportModal={() => { setReportToEdit(null); setShowCreateReportModal(true);}} onViewReportDetails={handleViewReportDetails} onEditReport={handleEditReport} />;
                    case 'AdminIncidentReports': return <AdminIncidentReportsPage incidentReports={incidentReports} children={children} staff={staff} loading={loadingData.incidentReports || false} onOpenLogIncidentModal={() => setShowLogIncidentModal(true)} onViewIncidentDetails={handleViewIncidentDetails} />;
                    case 'ChildMedicationsPage': return childForMedications ? <ChildMedicationsPage child={childForMedications} onOpenAddMedicationModal={handleOpenAddMedicationModal} onOpenEditMedicationModal={handleOpenEditMedicationModal} onOpenLogAdministrationModal={handleOpenLogAdministrationModal} onDeleteMedication={deleteMedicationFromSupabase} onCancel={() => {setChildForMedications(null); setCurrentPage('Children');}} /> : <Loading />;
                    case 'AdminAnnouncements': return <AdminAnnouncementsPage announcements={announcements} staff={staff} loading={loadingData.announcements || false} onNavigateToCreateAnnouncement={handleOpenCreateAnnouncementModal} onEditAnnouncement={handleEditAnnouncement} onDeleteAnnouncement={deleteAnnouncementFromSupabase} />;
                    case 'AdminBilling': return <AdminBillingPage invoices={invoices} children={children} loading={loadingData.invoices || false} onOpenCreateInvoiceModal={() => setShowCreateInvoiceModal(true)} onViewInvoiceDetails={handleViewInvoiceDetails} />;
                    case 'AdminWaitlist': return <AdminWaitlistPage waitlistEntries={waitlistEntries} loading={loadingData.waitlistEntries || false} onOpenAddWaitlistModal={handleOpenAddWaitlistModal} onEditWaitlistEntry={handleEditWaitlistEntry} onDeleteWaitlistEntry={deleteWaitlistEntryFromSupabase} />;
                    case 'AdminGallery': return <AdminGalleryPage />;
                    case 'Communications': return <CommunicationsPage />;
                    default: return <AdminDashboardPage />; 
                }
    
            case 'teacher':
                switch (pageToRender) {
                    case 'TeacherDashboard': return <TeacherDashboardPage />;
                    case 'Children': return <ChildrenPage childrenList={children} loading={loadingData.children || false} onOpenAddChildModal={() => setShowAddChildModal(true)} onEditChild={handleOpenEditChildModal} onDeleteChild={deleteChildFromSupabase} onToggleCheckIn={toggleChildCheckInStatus} onNavigateToChildMedications={handleNavigateToChildMedications} />;
                    case 'ChildMedicationsPage': return childForMedications ? <ChildMedicationsPage child={childForMedications} onOpenAddMedicationModal={handleOpenAddMedicationModal} onOpenEditMedicationModal={handleOpenEditMedicationModal} onOpenLogAdministrationModal={handleOpenLogAdministrationModal} onDeleteMedication={deleteMedicationFromSupabase} onCancel={() => {setChildForMedications(null); setCurrentPage('Children');}} /> : <Loading />;
                    case 'AdminDailyReports': return <AdminDailyReportsPage dailyReports={dailyReports} children={children} staff={staff} loading={loadingData.dailyReports || false} onOpenCreateReportModal={() => { setReportToEdit(null); setShowCreateReportModal(true);}} onViewReportDetails={handleViewReportDetails} onEditReport={handleEditReport} />;
                    case 'AdminGallery': return <AdminGalleryPage />;
                    case 'AdminAnnouncements': return <AdminAnnouncementsPage announcements={announcements} staff={staff} loading={loadingData.announcements || false} onNavigateToCreateAnnouncement={handleOpenCreateAnnouncementModal} onEditAnnouncement={handleEditAnnouncement} onDeleteAnnouncement={deleteAnnouncementFromSupabase} />;
                    case 'Communications': return <CommunicationsPage />;
                    default: return <TeacherDashboardPage />;
                }
    
            case 'assistant':
                switch (currentPage) {
                    case 'AssistantDashboard': return <div>Assistant Dashboard</div>;
                    case 'AdminDailyReports': return <AdminDailyReportsPage dailyReports={dailyReports} children={children} staff={staff} loading={loadingData.dailyReports || false} onOpenCreateReportModal={() => setShowCreateReportModal(true)} onViewReportDetails={handleViewReportDetails} onEditReport={null} />;
                    case 'AdminGallery': return <AdminGalleryPage />;
                    default: return <div>Assistant Dashboard</div>;
                }
    
            case 'parent':
                const getParentChildren = () => {
                    if (!currentUser || !currentUser.profileId || !Array.isArray(children)) return [];
                    return children.filter(c => c.primary_parent_id === currentUser.profileId || c.secondary_parent_id === currentUser.profileId);
                };
                const parentChildren = getParentChildren();
                const parentChildrenIds = parentChildren.map(c => c.id);

                switch (pageToRender) {
                    case 'ParentDashboard': return <ParentDashboardPage currentUser={currentUser} />;
                    case 'ParentDailyReports': {
                        const filteredDailyReports = dailyReports.filter(report => parentChildrenIds.includes(report.child_id));
                        return <AdminDailyReportsPage dailyReports={filteredDailyReports} children={parentChildren} staff={staff} loading={loadingData.dailyReports || false} onOpenCreateReportModal={null} onViewReportDetails={handleViewReportDetails} onEditReport={null} />;
                    }
                    case 'ParentInvoices': {
                        const filteredInvoices = invoices.filter(inv => parentChildrenIds.includes(inv.child_id));
                        return <AdminBillingPage invoices={filteredInvoices} children={parentChildren} loading={loadingData.invoices || false} onOpenCreateInvoiceModal={null} onViewInvoiceDetails={handleViewInvoiceDetails} />;
                    }
                    case 'ParentMedications': {
                         return <ChildrenPage childrenList={parentChildren} loading={loadingData.children || false} onOpenAddChildModal={()=>{}} onEditChild={()=>{}} onDeleteChild={()=>{}} onToggleCheckIn={()=>{}} onNavigateToChildMedications={handleNavigateToChildMedications} />;
                    }
                     case 'ChildMedicationsPage': return childForMedications ? <ChildMedicationsPage child={childForMedications} onOpenAddMedicationModal={handleOpenAddMedicationModal} onOpenEditMedicationModal={handleOpenEditMedicationModal} onOpenLogAdministrationModal={handleOpenLogAdministrationModal} onDeleteMedication={deleteMedicationFromSupabase} onCancel={() => {setChildForMedications(null); setCurrentPage('ParentMedications');}} /> : <Loading />;
                    case 'AdminGallery': return <AdminGalleryPage />;
                    case 'AdminAnnouncements': return <AdminAnnouncementsPage announcements={announcements} staff={staff} loading={loadingData.announcements || false} onNavigateToCreateAnnouncement={null} onEditAnnouncement={null} onDeleteAnnouncement={null} />;
                    case 'Communications': return <CommunicationsPage />;
                    default: return <ParentDashboardPage currentUser={currentUser} />;
                }
            case 'unknown_profile':
            case 'exception_profile':
                return <UnknownRolePage />;
            default:
                return <AuthPage onSignUp={handleSignUp} onSignIn={handleSignIn} loading={authActionLoading} />;
        }
    };
    
    // --- Main Return for App Component ---
    if (appIsLoading) {
        return <Loading />;
    }
    
    return (
        <ErrorBoundary>
            <AppStateContext.Provider value={{
                currentUser, appMode, showAlert, children, staff, rooms, dailyReports, incidentReports, medications, medicationLogs, announcements, invoices, waitlistEntries, parentsList, setCurrentPage, loadingData, messages, addMessageToSupabase
            }}>
                <div className={`app-container`}>
                    {(!session || appMode === 'auth') ? (
                        <AuthPage onSignUp={handleSignUp} onSignIn={handleSignIn} loading={authActionLoading} />
                    ) : (
                        <div className={`main-app-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                             {(appMode !== 'auth' && !['unknown_profile', 'exception_profile'].includes(appMode) && currentNavItems.length > 0) && (
                                <aside className="sidebar">
                                    <div className="sidebar-header">
                                        {isSidebarOpen && <span className="sidebar-title">{currentPortalName}</span>}
                                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="sidebar-toggle-button">
                                            {isSidebarOpen ? <Icons.X size={20} /> : <Icons.Menu size={20} />}
                                        </button>
                                    </div>
                                    <nav className="sidebar-nav">
                                        {currentNavItems.map(item => (
                                            <button key={item.name} onClick={() => { setCurrentPage(item.name); if (window.innerWidth <= 768 && isSidebarOpen) setIsSidebarOpen(false); }} className={`sidebar-nav-item ${currentPage === item.name ? 'active' : ''}`} title={item.label || item.name}>
                                                <item.icon size={isSidebarOpen ? 18 : 22} />
                                                {isSidebarOpen && <span className="sidebar-nav-label">{item.label || item.name}</span>}
                                            </button>
                                        ))}
                                    </nav>
                                    <div className="sidebar-footer">
                                        <button onClick={handleSignOut} className={`btn btn-danger ${isSidebarOpen ? 'btn-full-width' : 'btn-icon'}`} title="Sign Out">
                                            <Icons.LogOut size={20} />
                                            {isSidebarOpen && <span className="ml-2">Sign Out</span>}
                                        </button>
                                    </div>
                                </aside>
                            )}
                            <main className="main-content">
                                <header className="main-header">
                                    {(appMode !== 'auth' && !['unknown_profile', 'exception_profile'].includes(appMode) && currentNavItems.length > 0) && (
                                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="mobile-menu-button">
                                            <Icons.Menu size={24} />
                                        </button>
                                    )}
                                    <h1 className="page-title">{currentNavItems.find(item => item.name === currentPage)?.label || currentPage.replace(/([A-Z])/g, ' $1').trim() || "Daycare Management"}</h1>
                                    <div className="header-user-controls">
                                        {session?.user && <div className="user-email">Logged in: <span>{currentUser?.name || session.user.email} ({currentUser?.role || 'N/A'})</span></div>}
                                    </div>
                                </header>
                                <div className="page-content-area">{renderCurrentPage()}</div>
                            </main>
                        </div>
                    )}
                    <footer className="app-footer">Evergreen Tots 2025 &copy; Evergreen Tots App</footer>
                    
                    {session && showAddChildModal && <AddChildModal onAddChild={addChildToSupabase} onClose={() => setShowAddChildModal(false)} showAlert={showAlert} parentsList={parentsList} rooms={rooms} />}
                    {session && showEditChildModal && childToEdit && <EditChildModal child={childToEdit} parentsList={parentsList} showAlert={showAlert} rooms={rooms} onClose={() => { setShowEditChildModal(false); setChildToEdit(null); }} onUpdateChild={updateChildInSupabase} />}
                    {session && showAddStaffModal && <AddStaffModal onAddStaff={addStaffToSupabase} onClose={() => setShowAddStaffModal(false)} currentUser={currentUser} showAlert={showAlert} rooms={rooms} />}
                    {session && showEditStaffModal && staffToEdit && <EditStaffModal staffMember={staffToEdit} rooms={rooms} onClose={() => { setShowEditStaffModal(false); setStaffToEdit(null); }} onUpdateStaff={updateStaffInSupabase} showAlert={showAlert} />}
                    {session && showAddParentModal && <AddParentModal onAddParent={addParentToSupabase} onClose={() => setShowAddParentModal(false)} showAlert={showAlert} />}
                    {session && showEditParentModal && parentToEdit && <EditParentModal parent={parentToEdit} onClose={() => { setShowEditParentModal(false); setParentToEdit(null);}} onUpdateParent={updateParentInSupabase} showAlert={showAlert} />}
                    {session && showAddRoomModal && <AddRoomModal onAddRoom={addRoomToSupabase} onClose={() => setShowAddRoomModal(false)} />}
                    {session && showEditRoomModal && roomToEdit && <EditRoomModal room={roomToEdit} onClose={() => { setShowEditRoomModal(false); setRoomToEdit(null); }} onUpdateRoom={updateRoomInSupabase} showAlert={showAlert} />}
                    {session && showCreateReportModal && <CreateOrEditDailyReportModal children={children} staff={staff} currentUser={currentUser} onAddDailyReport={addDailyReportToSupabase} onUpdateDailyReport={updateDailyReportInSupabase} initialData={reportToEdit} onCancel={() => { setReportToEdit(null); setShowCreateReportModal(false); }} showAlert={showAlert} />}
                    {session && showViewDailyReportModal && reportToView && <ViewDailyReportModal report={reportToView} child={children.find(c => c.id === reportToView.child_id)} staff={staff} onClose={() => { setShowViewDailyReportModal(false); setReportToView(null); }} />}
                    {session && showLogIncidentModal && <LogIncidentModal children={children} staff={staff} currentUser={currentUser} onLogIncident={addIncidentReportToSupabase} onCancel={() => setShowLogIncidentModal(false)} showAlert={showAlert} />}
                    {session && showViewIncidentModal && incidentToView && <ViewIncidentDetailsModal incident={incidentToView} child={children.find(c => c.id === incidentToView.child_id)} reportedByStaff={staff.find(s => s.id === incidentToView.reported_by_staff_id)} onClose={() => { setShowViewIncidentModal(false); setIncidentToView(null); }} />}
                    {session && showAddMedicationModal && childForMedications && <AddMedicationModal childId={childForMedications.id} onClose={() => setShowAddMedicationModal(false)} onAddMedication={addMedicationToSupabase} showAlert={showAlert} />}
                    {session && showEditMedicationModal && medicationToEdit && <EditMedicationModal medication={medicationToEdit} onClose={() => {setShowEditMedicationModal(false); setMedicationToEdit(null);}} onUpdateMedication={updateMedicationInSupabase} showAlert={showAlert} />}
                    {session && showLogMedicationModal && medicationToLog && childForMedications && <LogMedicationAdministrationModal medicationToLog={medicationToLog} childId={childForMedications.id} onClose={() => {setShowLogMedicationModal(false); setMedicationToLog(null);}} onLogAdministration={addMedicationLogToSupabase} currentUser={currentUser} showAlert={showAlert} />}
                    {session && showCreateAnnouncementModal && <CreateAnnouncementPage onAddAnnouncement={addAnnouncementToSupabase} onUpdateAnnouncement={updateAnnouncementInSupabase} onCancel={() => {setAnnouncementToEdit(null); setShowCreateAnnouncementModal(false);}} currentUser={currentUser} initialData={announcementToEdit} showAlert={showAlert} />}
                    {session && showCreateInvoiceModal && <CreateInvoiceModal children={children} onAddInvoice={addInvoiceToSupabase} onCancel={() => setShowCreateInvoiceModal(false)} showAlert={showAlert} />}
                    {session && showViewInvoiceModal && invoiceToView && <ViewInvoiceDetailsModal invoice={invoiceToView} child={children.find(c => c.id === invoiceToView.child_id)} parentDetails={parentDetailsForInvoice} onClose={() => { setShowViewInvoiceModal(false); setInvoiceToView(null); setParentDetailsForInvoice(null); }} />}
                    {session && showAddWaitlistModal && <AddOrEditWaitlistModal onAddOrUpdateWaitlistEntry={addOrUpdateWaitlistEntryToSupabase} onCancel={() => {setWaitlistEntryToEdit(null); setShowAddWaitlistModal(false);}} showAlert={showAlert} initialData={waitlistEntryToEdit} />}
                </div>
            </AppStateContext.Provider>
        </ErrorBoundary>
    );
};

export default App;

    