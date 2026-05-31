export interface Patient {
  _id: string;
  patientName: string;
  patientId: number;
  age: number;
  gender: string;
  phone: string;
  address: string;
  bloodGroup: string;
  createdAt: string;
}

export interface Doctor {
  _id: string;
  doctorName: string;
  doctorId: number;
  specialization: string;
  experience: number;
  phone: string;
  availability: string;
}

export interface Appointment {
  _id: string;
  patientId: string; // references Patient._id
  doctorId: string;  // references Doctor._id
  appointmentDate: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  
  // Populated fields (if requested)
  patient?: Patient;
  doctor?: Doctor;
}

export interface Treatment {
  _id: string;
  patientId: string; // references Patient._id
  doctorId: string;  // references Doctor._id
  diagnosis: string;
  prescription: string;
  treatmentDate: string;

  // Populated fields (if requested)
  patient?: Patient;
  doctor?: Doctor;
}

export interface Billing {
  _id: string;
  patientId: string; // references Patient._id
  totalAmount: number;
  paymentStatus: 'Paid' | 'Pending';
  paymentDate: string;

  // Populated fields (if requested)
  patient?: Patient;
}

export interface DatabaseStats {
  appointmentsCount: number;
  patientsCount: number;
  doctorsCount: number;
  totalRevenue: number;
  pendingBillsCount: number;
  mostVisitedDoctor: {
    doctorName: string;
    specialization: string;
    totalVisits: number;
  } | null;
  revenueTrend?: { date: string; amount: number }[];
  patientIntakeTrend?: { date: string; count: number }[];
}
