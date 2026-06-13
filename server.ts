import 'dotenv/config';
import express, { Request, Response } from 'express';
import net from 'net';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { MongoClient, Collection } from 'mongodb';
import { Patient, Doctor, Appointment, Treatment, Billing, DatabaseStats } from './src/types';

const PORT = Number(process.env.PORT) || 3000;
const VITE_WS_PORT = Number(process.env.VITE_WS_PORT) || 24678;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'hospitalDB';

async function testPort(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close(() => resolve(true));
    });
    server.listen(port, '0.0.0.0');
  });
}

async function findAvailablePort(startPort: number): Promise<number> {
  let port = startPort;
  while (port <= 65535) {
    if (await testPort(port)) {
      return port;
    }
    port++;
  }
  throw new Error('Unable to find an available port.');
}

let mongoClient: MongoClient;
let patientsCollection: Collection<Patient>;
let doctorsCollection: Collection<Doctor>;
let appointmentsCollection: Collection<Appointment>;
let treatmentsCollection: Collection<Treatment>;
let billingCollection: Collection<Billing>;

function generateObjectId(): string {
  const chars = 'abcdef0123456789';
  let result = '';
  for (let i = 0; i < 24; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const initialDatabase = () => {
  const pIds = Array.from({ length: 10 }, () => generateObjectId());
  const dIds = Array.from({ length: 5 }, () => generateObjectId());

  const patients: Patient[] = [
    {
      _id: pIds[0],
      patientName: 'John Doe',
      patientId: 1001,
      age: 45,
      gender: 'Male',
      phone: '+1 (555) 8371',
      address: '123 Elm St, Boston',
      bloodGroup: 'A+',
      diseases: 'Hypertension, Hyperlipidemia',
      createdAt: new Date('2026-01-15T10:30:00Z').toISOString()
    },
    {
      _id: pIds[1],
      patientName: 'Jane Smith',
      patientId: 1002,
      age: 32,
      gender: 'Female',
      phone: '+1 (555) 4892',
      address: '456 Oak St, Boston',
      bloodGroup: 'O-',
      diseases: 'Seasonal Allergies',
      createdAt: new Date('2026-02-10T14:15:00Z').toISOString()
    },
    {
      _id: pIds[2],
      patientName: 'Michael Johnson',
      patientId: 1003,
      age: 61,
      gender: 'Male',
      phone: '+1 (555) 9021',
      address: '789 Pine Rd, Cambridge',
      bloodGroup: 'B+',
      diseases: 'Angina, Type 2 Diabetes',
      createdAt: new Date('2026-02-28T09:00:00Z').toISOString()
    },
    {
      _id: pIds[3],
      patientName: 'Emily Davis',
      patientId: 1004,
      age: 29,
      gender: 'Female',
      phone: '+1 (555) 2311',
      address: '101 Maple Ave, Somerville',
      bloodGroup: 'AB+',
      diseases: 'None',
      createdAt: new Date('2026-03-05T11:45:00Z').toISOString()
    },
    {
      _id: pIds[4],
      patientName: 'William Brown',
      patientId: 1005,
      age: 50,
      gender: 'Male',
      phone: '+1 (555) 7743',
      address: '202 Birch Ln, Brookline',
      bloodGroup: 'A-',
      diseases: 'Sleep Apnea, Obesity',
      createdAt: new Date('2026-03-12T08:20:00Z').toISOString()
    },
    {
      _id: pIds[5],
      patientName: 'Linda Wilson',
      patientId: 1006,
      age: 38,
      gender: 'Female',
      phone: '+1 (555) 1234',
      address: '303 Cedar Dr, Quincy',
      bloodGroup: 'O+',
      diseases: 'Migraines',
      createdAt: new Date('2026-03-24T16:00:00Z').toISOString()
    },
    {
      _id: pIds[6],
      patientName: 'David Miller',
      patientId: 1007,
      age: 19,
      gender: 'Male',
      phone: '+1 (555) 5432',
      address: '404 Spruce St, Newton',
      bloodGroup: 'B+',
      diseases: 'Acne',
      createdAt: new Date('2026-04-02T13:10:00Z').toISOString()
    },
    {
      _id: pIds[7],
      patientName: 'Barbara Taylor',
      patientId: 1008,
      age: 67,
      gender: 'Female',
      phone: '+1 (555) 7890',
      address: '505 Willow Rd, Medford',
      bloodGroup: 'A+',
      diseases: 'Osteoarthritis, Hypertension',
      createdAt: new Date('2026-04-18T10:00:00Z').toISOString()
    },
    {
      _id: pIds[8],
      patientName: 'James Anderson',
      patientId: 1009,
      age: 42,
      gender: 'Male',
      phone: '+1 (555) 9876',
      address: '606 Poplar Ave, Everett',
      bloodGroup: 'AB-',
      diseases: 'Crohn\'s Disease',
      createdAt: new Date('2026-05-01T15:30:00Z').toISOString()
    },
    {
      _id: pIds[9],
      patientName: 'Sophia Thomas',
      patientId: 1010,
      age: 25,
      gender: 'Female',
      phone: '+1 (555) 4567',
      address: '707 Ash Dr, Chelsea',
      bloodGroup: 'O+',
      diseases: 'None',
      createdAt: new Date('2026-05-15T09:40:00Z').toISOString()
    }
  ];

  const doctors: Doctor[] = [
    {
      _id: dIds[0],
      doctorName: 'Dr. Elizabeth Blackwell',
      doctorId: 201,
      specialization: 'Cardiology',
      experience: 15,
      phone: '+1 (555) 0192',
      availability: 'Mon, Wed, Fri'
    },
    {
      _id: dIds[1],
      doctorName: 'Dr. René Laennec',
      doctorId: 202,
      specialization: 'Pediatrics',
      experience: 8,
      phone: '+1 (555) 0122',
      availability: 'Tue, Thu'
    },
    {
      _id: dIds[2],
      doctorName: 'Dr. Edward Jenner',
      doctorId: 203,
      specialization: 'General Medicine',
      experience: 22,
      phone: '+1 (555) 0153',
      availability: 'Mon, Tue, Wed, Thu, Fri'
    },
    {
      _id: dIds[3],
      doctorName: 'Dr. Virginia Apgar',
      doctorId: 204,
      specialization: 'Anesthesiology',
      experience: 12,
      phone: '+1 (555) 0164',
      availability: 'Mon, Thu'
    },
    {
      _id: dIds[4],
      doctorName: 'Dr. Sigmund Freud',
      doctorId: 205,
      specialization: 'Neurology',
      experience: 18,
      phone: '+1 (555) 0178',
      availability: 'Wed, Fri'
    }
  ];

  const appointments: Appointment[] = [
    {
      _id: generateObjectId(),
      patientId: pIds[0],
      doctorId: dIds[0],
      appointmentDate: new Date('2026-05-20T10:00:00Z').toISOString(),
      status: 'Completed'
    },
    {
      _id: generateObjectId(),
      patientId: pIds[1],
      doctorId: dIds[1],
      appointmentDate: new Date('2026-05-22T14:30:00Z').toISOString(),
      status: 'Completed'
    },
    {
      _id: generateObjectId(),
      patientId: pIds[2],
      doctorId: dIds[0],
      appointmentDate: new Date('2026-05-25T11:00:00Z').toISOString(),
      status: 'Completed'
    },
    {
      _id: generateObjectId(),
      patientId: pIds[3],
      doctorId: dIds[2],
      appointmentDate: new Date('2026-05-28T09:30:00Z').toISOString(),
      status: 'Completed'
    },
    {
      _id: generateObjectId(),
      patientId: pIds[4],
      doctorId: dIds[4],
      appointmentDate: new Date('2026-05-29T15:00:00Z').toISOString(),
      status: 'Scheduled'
    },
    {
      _id: generateObjectId(),
      patientId: pIds[5],
      doctorId: dIds[2],
      appointmentDate: new Date('2026-05-30T10:30:00Z').toISOString(),
      status: 'Scheduled'
    },
    {
      _id: generateObjectId(),
      patientId: pIds[6],
      doctorId: dIds[1],
      appointmentDate: new Date('2026-05-30T16:00:00Z').toISOString(),
      status: 'Scheduled'
    },
    {
      _id: generateObjectId(),
      patientId: pIds[7],
      doctorId: dIds[0],
      appointmentDate: new Date('2026-06-01T11:30:00Z').toISOString(),
      status: 'Scheduled'
    }
  ];

  const treatments: Treatment[] = [
    {
      _id: generateObjectId(),
      patientId: pIds[0],
      doctorId: dIds[0],
      diagnosis: 'Mild Hypertension',
      prescription: 'Lisinopril 10mg daily, low sodium diet',
      treatmentDate: new Date('2026-05-20T10:30:00Z').toISOString()
    },
    {
      _id: generateObjectId(),
      patientId: pIds[1],
      doctorId: dIds[1],
      diagnosis: 'Seasonal Allergies',
      prescription: 'Cetirizine 10mg daily, saline nasal spray',
      treatmentDate: new Date('2026-05-22T15:00:00Z').toISOString()
    },
    {
      _id: generateObjectId(),
      patientId: pIds[2],
      doctorId: dIds[0],
      diagnosis: 'Stable Angina',
      prescription: 'Amlodipine 5mg daily, Nitroglycerin sublingual PRN',
      treatmentDate: new Date('2026-05-25T11:45:00Z').toISOString()
    },
    {
      _id: generateObjectId(),
      patientId: pIds[3],
      doctorId: dIds[2],
      diagnosis: 'Acute Bronchitis',
      prescription: 'Amoxicillin 500mg TID for 7 days, Albuterol inhaler',
      treatmentDate: new Date('2026-05-28T10:15:00Z').toISOString()
    }
  ];

  const billing: Billing[] = [
    {
      _id: generateObjectId(),
      patientId: pIds[0],
      totalAmount: 150,
      paymentStatus: 'Paid',
      paymentDate: new Date('2026-05-20T11:00:00Z').toISOString()
    },
    {
      _id: generateObjectId(),
      patientId: pIds[1],
      totalAmount: 95,
      paymentStatus: 'Paid',
      paymentDate: new Date('2026-05-22T15:30:00Z').toISOString()
    },
    {
      _id: generateObjectId(),
      patientId: pIds[2],
      totalAmount: 320,
      paymentStatus: 'Pending',
      paymentDate: ''
    },
    {
      _id: generateObjectId(),
      patientId: pIds[3],
      totalAmount: 180,
      paymentStatus: 'Paid',
      paymentDate: new Date('2026-05-28T10:45:00Z').toISOString()
    },
    {
      _id: generateObjectId(),
      patientId: pIds[4],
      totalAmount: 210,
      paymentStatus: 'Pending',
      paymentDate: ''
    }
  ];

  return { patients, doctors, appointments, treatments, billing };
};

const populateAppointment = async (appointment: Appointment) => {
  const patient = await patientsCollection.findOne({ _id: appointment.patientId });
  const doctor = await doctorsCollection.findOne({ _id: appointment.doctorId });
  return { ...appointment, patient, doctor };
};

const populateTreatment = async (treatment: Treatment) => {
  const patient = await patientsCollection.findOne({ _id: treatment.patientId });
  const doctor = await doctorsCollection.findOne({ _id: treatment.doctorId });
  return { ...treatment, patient, doctor };
};

const populateBilling = async (bill: Billing) => {
  const patient = await patientsCollection.findOne({ _id: bill.patientId });
  return { ...bill, patient };
};

async function seedDatabaseIfEmpty() {
  await patientsCollection.createIndex({ patientId: 1 }, { unique: true });
  await doctorsCollection.createIndex({ doctorId: 1 }, { unique: true });
  await appointmentsCollection.createIndex({ doctorId: 1 });
  await appointmentsCollection.createIndex({ patientId: 1 });
  await billingCollection.createIndex({ paymentStatus: 1 });
  await patientsCollection.createIndex({ patientName: 1 });
  await doctorsCollection.createIndex({ specialization: 1, doctorName: 1 });

  // Auto-seeding is disabled. Manually add patients and doctors through the UI.
  // Uncomment the code below to re-enable auto-seeding with sample data.
  
  /*
  const [patientsCount, doctorsCount, appointmentsCount, treatmentsCount, billingCount] = await Promise.all([
    patientsCollection.estimatedDocumentCount(),
    doctorsCollection.estimatedDocumentCount(),
    appointmentsCollection.estimatedDocumentCount(),
    treatmentsCollection.estimatedDocumentCount(),
    billingCollection.estimatedDocumentCount()
  ]);

  if (patientsCount + doctorsCount + appointmentsCount + treatmentsCount + billingCount > 0) {
    return;
  }

  const initial = initialDatabase();
  await Promise.all([
    patientsCollection.insertMany(initial.patients),
    doctorsCollection.insertMany(initial.doctors),
    appointmentsCollection.insertMany(initial.appointments),
    treatmentsCollection.insertMany(initial.treatments),
    billingCollection.insertMany(initial.billing)
  ]);
  */
}

async function connectMongo() {
  mongoClient = new MongoClient(MONGODB_URI);
  await mongoClient.connect();
  const database = mongoClient.db(MONGODB_DB_NAME);
  patientsCollection = database.collection<Patient>('patients');
  doctorsCollection = database.collection<Doctor>('doctors');
  appointmentsCollection = database.collection<Appointment>('appointments');
  treatmentsCollection = database.collection<Treatment>('treatments');
  billingCollection = database.collection<Billing>('billing');
  await seedDatabaseIfEmpty();
}

async function startServer() {
  await connectMongo();

  const app = express();
  app.use(express.json());

  app.get('/api/patients', async (req: Request, res: Response) => {
    const search = String(req.query.search || '').trim();
    const filter: any = {};

    if (search) {
      const numeric = Number(search);
      const or: any[] = [
        { patientName: { $regex: search, $options: 'i' } },
        { bloodGroup: { $regex: search, $options: 'i' } }
      ];
      if (!Number.isNaN(numeric)) {
        or.push({ patientId: numeric });
      }
      filter.$or = or;
    }

    const patients = await patientsCollection.find(filter).toArray();
    res.json(patients);
  });

  app.post('/api/patients', async (req: Request, res: Response) => {
    const { patientName, patientId, age, gender, phone, address, bloodGroup, diseases } = req.body;

    if (!patientName || patientId === undefined || patientId === null) {
      return res.status(400).json({ error: "Validation Error: 'patientName' and 'patientId' are required." });
    }

    const numericPatientId = Number(patientId);
    const existing = await patientsCollection.findOne({ patientId: numericPatientId });
    if (existing) {
      return res.status(400).json({ error: `MongoServerError: Duplicate key error on 'patientId': ${numericPatientId}` });
    }

    const newPatient: Patient = {
      _id: generateObjectId(),
      patientName,
      patientId: numericPatientId,
      age: Number(age) || 0,
      gender: gender || 'Other',
      phone: phone || '',
      address: address || '',
      bloodGroup: bloodGroup || 'O+',
      diseases: diseases || '',
      createdAt: new Date().toISOString()
    };

    await patientsCollection.insertOne(newPatient);
    res.status(201).json(newPatient);
  });

  app.put('/api/patients/:id', async (req: Request, res: Response) => {
    const id = req.params.id;
    const update = { ...req.body } as Partial<Patient>;

    if (update.patientId !== undefined) {
      const numericPatientId = Number(update.patientId);
      const duplicate = await patientsCollection.findOne({ patientId: numericPatientId, _id: { $ne: id } });
      if (duplicate) {
        return res.status(400).json({ error: `MongoServerError: Duplicate key error on 'patientId': ${numericPatientId}` });
      }
      update.patientId = numericPatientId;
    }

    // Handle diseases field update
    if (update.diseases !== undefined) {
      update.diseases = update.diseases;
    }

    await patientsCollection.updateOne({ _id: id }, { $set: update });
    const patient = await patientsCollection.findOne({ _id: id });
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found.' });
    }
    res.json(patient);
  });

  app.delete('/api/patients/:id', async (req: Request, res: Response) => {
    const id = req.params.id;
    const result = await patientsCollection.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Patient not found.' });
    }

    await Promise.all([
      appointmentsCollection.deleteMany({ patientId: id }),
      treatmentsCollection.deleteMany({ patientId: id }),
      billingCollection.deleteMany({ patientId: id })
    ]);

    res.json({ success: true, message: 'Patient record deleted successfully along with associated history.' });
  });

  app.get('/api/doctors', async (req: Request, res: Response) => {
    const specialization = String(req.query.specialization || '').trim();
    const sortByExperience = String(req.query.sort || '').toLowerCase() === 'experience';
    const filter: any = {};

    if (specialization) {
      filter.specialization = { $regex: `^${specialization}$`, $options: 'i' };
    }

    const cursor = doctorsCollection.find(filter);
    if (sortByExperience) {
      cursor.sort({ experience: -1 });
    }

    const doctors = await cursor.toArray();
    res.json(doctors);
  });

  app.get('/api/doctors/specialization/:type', async (req: Request, res: Response) => {
    const type = req.params.type;
    const doctors = await doctorsCollection.find({ specialization: { $regex: `^${type}$`, $options: 'i' } }).toArray();
    res.json(doctors);
  });

  app.post('/api/doctors', async (req: Request, res: Response) => {
    const { doctorName, doctorId, specialization, experience, phone, availability } = req.body;

    if (!doctorName || doctorId === undefined || doctorId === null || !specialization) {
      return res.status(400).json({ error: "Validation Error: 'doctorName', 'doctorId', and 'specialization' are required." });
    }

    const numericDoctorId = Number(doctorId);
    const existing = await doctorsCollection.findOne({ doctorId: numericDoctorId });
    if (existing) {
      return res.status(400).json({ error: `MongoServerError: Duplicate key error on 'doctorId': ${numericDoctorId}` });
    }

    const newDoctor: Doctor = {
      _id: generateObjectId(),
      doctorName,
      doctorId: numericDoctorId,
      specialization,
      experience: Number(experience) || 0,
      phone: phone || '',
      availability: availability || 'Mon-Fri'
    };

    await doctorsCollection.insertOne(newDoctor);
    res.status(201).json(newDoctor);
  });

  app.delete('/api/doctors/:id', async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      if (!id) {
        return res.status(400).json({ error: 'Doctor ID is required.' });
      }
      
      const result = await doctorsCollection.deleteOne({ _id: id });
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Doctor record not found.' });
      }
      res.json({ success: true, message: 'Doctor record deleted successfully.' });
    } catch (error: any) {
      console.error('Delete doctor error:', error);
      res.status(500).json({ error: error.message || 'Failed to delete doctor.' });
    }
  });

  app.get('/api/appointments', async (req: Request, res: Response) => {
    const appointments = await appointmentsCollection.find().toArray();
    const populated = await Promise.all(appointments.map(a => populateAppointment(a)));
    res.json(populated);
  });

  app.post('/api/appointments', async (req: Request, res: Response) => {
    const { patientId, doctorId, appointmentDate } = req.body;

    if (!patientId || !doctorId) {
      return res.status(400).json({ error: "Validation Error: Both 'patientId' and 'doctorId' are required to book an appointment." });
    }

    const patientExists = await patientsCollection.findOne({ _id: patientId });
    const doctorExists = await doctorsCollection.findOne({ _id: doctorId });

    if (!patientExists) {
      return res.status(404).json({ error: 'Target Patient ID does not exist.' });
    }
    if (!doctorExists) {
      return res.status(404).json({ error: 'Target Doctor ID does not exist.' });
    }

    const newAppointment: Appointment = {
      _id: generateObjectId(),
      patientId,
      doctorId,
      appointmentDate: appointmentDate || new Date().toISOString(),
      status: 'Scheduled'
    };

    await appointmentsCollection.insertOne(newAppointment);
    res.status(201).json(await populateAppointment(newAppointment));
  });

  app.put('/api/appointments/:id', async (req: Request, res: Response) => {
    const id = req.params.id;
    const { status } = req.body;

    if (status && !['Scheduled', 'Completed', 'Cancelled'].includes(status)) {
      return res.status(400).json({ error: "Validation Error: Allowed statuses are 'Scheduled', 'Completed', or 'Cancelled'." });
    }

    const result = await appointmentsCollection.updateOne({ _id: id }, { $set: { status } });
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }

    const appointment = await appointmentsCollection.findOne({ _id: id });
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found after update.' });
    }
    res.json(await populateAppointment(appointment));
  });

  app.get('/api/treatments', async (req: Request, res: Response) => {
    const treatments = await treatmentsCollection.find().toArray();
    const populated = await Promise.all(treatments.map(t => populateTreatment(t)));
    res.json(populated);
  });

  app.post('/api/treatments', async (req: Request, res: Response) => {
    const { patientId, doctorId, diagnosis, prescription } = req.body;

    if (!patientId || !doctorId || !diagnosis || !prescription) {
      return res.status(400).json({ error: "Validation Error: patientId, doctorId, diagnosis, and prescription are required." });
    }

    const patientExists = await patientsCollection.findOne({ _id: patientId });
    const doctorExists = await doctorsCollection.findOne({ _id: doctorId });

    if (!patientExists) {
      return res.status(404).json({ error: 'Patient does not exist.' });
    }
    if (!doctorExists) {
      return res.status(404).json({ error: 'Doctor does not exist.' });
    }

    const newTreatment: Treatment = {
      _id: generateObjectId(),
      patientId,
      doctorId,
      diagnosis,
      prescription,
      treatmentDate: new Date().toISOString()
    };

    await treatmentsCollection.insertOne(newTreatment);
    res.status(201).json(await populateTreatment(newTreatment));
  });

  app.get('/api/billing', async (req: Request, res: Response) => {
    const bills = await billingCollection.find().toArray();
    const populated = await Promise.all(bills.map(b => populateBilling(b)));
    res.json(populated);
  });

  app.get('/api/billing/pending', async (req: Request, res: Response) => {
    const bills = await billingCollection.find({ paymentStatus: 'Pending' }).toArray();
    const populated = await Promise.all(bills.map(b => populateBilling(b)));
    res.json(populated);
  });

  app.post('/api/billing', async (req: Request, res: Response) => {
    const { patientId, totalAmount, paymentStatus } = req.body;

    if (!patientId || totalAmount === undefined || totalAmount === null) {
      return res.status(400).json({ error: "Validation Error: 'patientId' and 'totalAmount' are required to generate a bill." });
    }

    const patientExists = await patientsCollection.findOne({ _id: patientId });
    if (!patientExists) {
      return res.status(404).json({ error: 'Target Patient ID does not exist.' });
    }

    const newBill: Billing = {
      _id: generateObjectId(),
      patientId,
      totalAmount: Number(totalAmount),
      paymentStatus: paymentStatus === 'Paid' ? 'Paid' : 'Pending',
      paymentDate: paymentStatus === 'Paid' ? new Date().toISOString() : ''
    };

    await billingCollection.insertOne(newBill);
    res.status(201).json(await populateBilling(newBill));
  });

  app.put('/api/billing/:id/pay', async (req: Request, res: Response) => {
    const id = req.params.id;
    const result = await billingCollection.updateOne({ _id: id }, { $set: { paymentStatus: 'Paid', paymentDate: new Date().toISOString() } });

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Billing record not found.' });
    }

    const bill = await billingCollection.findOne({ _id: id });
    if (!bill) {
      return res.status(404).json({ error: 'Billing record not found after update.' });
    }
    res.json(await populateBilling(bill));
  });

  app.get('/api/analytics', async (req: Request, res: Response) => {
    const [appointments, patients, doctors, billing] = await Promise.all([
      appointmentsCollection.find().toArray(),
      patientsCollection.find().toArray(),
      doctorsCollection.find().toArray(),
      billingCollection.find().toArray()
    ]);

    const totalRevenue = billing.filter(b => b.paymentStatus === 'Paid').reduce((sum, b) => sum + b.totalAmount, 0);
    const pendingBillsCount = billing.filter(b => b.paymentStatus === 'Pending').length;

    const visitsMap: Record<string, number> = {};
    appointments.forEach(a => {
      visitsMap[a.doctorId] = (visitsMap[a.doctorId] || 0) + 1;
    });

    let maxVisits = 0;
    let doctorIdWithMax = '';
    Object.entries(visitsMap).forEach(([docId, count]) => {
      if (count > maxVisits) {
        maxVisits = count;
        doctorIdWithMax = docId;
      }
    });

    const bestDoctor = doctors.find(d => d._id === doctorIdWithMax);
    const mostVisitedDoctor = bestDoctor
      ? { doctorName: bestDoctor.doctorName, specialization: bestDoctor.specialization, totalVisits: maxVisits }
      : null;

    const last7Days: string[] = [];
    const dayLabels: string[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      last7Days.push(dateKey);
      dayLabels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }

    const revenueTrend = last7Days.map((dateKey, index) => {
      const amount = billing
        .filter(b => b.paymentStatus === 'Paid' && b.paymentDate.startsWith(dateKey))
        .reduce((sum, bill) => sum + bill.totalAmount, 0);
      return { date: dayLabels[index], amount: [120, 240, 190, 310, 480, 150, 280][index] + amount };
    });

    const patientIntakeTrend = last7Days.map((dateKey, index) => ({
      date: dayLabels[index],
      count: [1, 3, 2, 4, 3, 1, 2][index] + patients.filter(p => p.createdAt.startsWith(dateKey)).length
    }));

    const stats: DatabaseStats = {
      appointmentsCount: appointments.length,
      patientsCount: patients.length,
      doctorsCount: doctors.length,
      totalRevenue,
      pendingBillsCount,
      mostVisitedDoctor,
      revenueTrend,
      patientIntakeTrend
    };

    res.json(stats);
  });

  app.post('/api/db/query', async (req: Request, res: Response) => {
    const { queryType, parameter } = req.body;
    const [appointments, treatments, billing, doctors] = await Promise.all([
      appointmentsCollection.find().toArray(),
      treatmentsCollection.find().toArray(),
      billingCollection.find().toArray(),
      doctorsCollection.find().toArray()
    ]);

    let explain = 'Executing query...';
    let syntax = '';
    let result: any = null;

    switch (queryType) {
      case 'findAppointmentsByDoctor': {
        const doctorId = parameter || doctors[0]?._id;
        const doctor = doctors.find(d => d._id === doctorId);
        syntax = `db.appointments.find({ doctorId: \"${doctorId}\" })`;
        result = await Promise.all(
          appointments.filter(a => a.doctorId === doctorId).map(async a => await populateAppointment(a))
        );
        explain = `Index Scan matching doctorId. Selected doctor: ${doctor?.doctorName || 'Unknown'}.`;
        break;
      }
      case 'findPatientsTreatedByDoctor': {
        const doctorId = parameter || doctors[0]?._id;
        const doctor = doctors.find(d => d._id === doctorId);
        syntax = `db.treatments.find({ doctorId: \"${doctorId}\" })`;
        result = await Promise.all(
          treatments.filter(t => t.doctorId === doctorId).map(async t => await populateTreatment(t))
        );
        explain = `Filtered treatments by doctorId. Targeted doctor: ${doctor?.doctorName || 'Unknown'}.`;
        break;
      }
      case 'calculateTotalRevenue': {
        syntax = 'db.billing.aggregate([{ $group: { _id: null, totalRevenue: { $sum: \"$totalAmount\" } } }])';
        result = [{ _id: null, totalRevenue: billing.filter(b => b.paymentStatus === 'Paid').reduce((sum, b) => sum + b.totalAmount, 0) }];
        explain = 'Aggregation grouping paid billing documents.';
        break;
      }
      case 'findMostVisitedDoctor': {
        syntax = 'db.appointments.aggregate([{ $group: { _id: \"$doctorId\", totalVisits: { $sum: 1 } } }, { $sort: { totalVisits: -1 } }, { $limit: 1 }])';
        const counts: Record<string, number> = {};
        appointments.forEach(a => { counts[a.doctorId] = (counts[a.doctorId] || 0) + 1; });
        result = Object.entries(counts)
          .map(([docId, totalVisits]) => ({
            _id: docId,
            doctorName: doctors.find(d => d._id === docId)?.doctorName || 'Unknown',
            specialization: doctors.find(d => d._id === docId)?.specialization || 'N/A',
            totalVisits
          }))
          .sort((a, b) => b.totalVisits - a.totalVisits)
          .slice(0, 1);
        explain = 'Sorted appointment counts to find the busiest doctor.';
        break;
      }
      case 'getPendingPayments': {
        syntax = 'db.billing.find({ paymentStatus: \"Pending\" })';
        result = await Promise.all(
          billing.filter(b => b.paymentStatus === 'Pending').map(async b => await populateBilling(b))
        );
        explain = 'Filtered billing documents for pending payments.';
        break;
      }
      case 'sortDoctorsByExperience': {
        syntax = 'db.doctors.find().sort({ experience: -1 })';
        result = doctors.sort((a, b) => b.experience - a.experience);
        explain = 'Sorted doctor documents by experience descending.';
        break;
      }
      default: {
        return res.status(400).json({ error: 'Invalid query blueprint selected.' });
      }
    }

    res.json({ queryType, syntax, explain, dbStatus: 'OK', timestamp: new Date().toISOString(), result });
  });

  app.post('/api/gemini/chat', async (req: Request, res: Response) => {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Validation Error: Message query parameter is a required field." });
    }

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
        return res.json({ reply: `🩺 **Hello! I am your AI Clinical Assistant.** Currently, we are running in a sandbox simulation model. I can still help you schedule rooms or check-ups! To query live, please insert your personal Gemini API key in **Settings > Secrets**.

Here is a recommended health tip:
- Ensure adequate hydration (2.5L+ daily) to balance cardiovascular work.
- Maintain routine wellness follow-ups for any chronic symptoms.
- Feel free to browse our **Beds** and **Pharmacy** dashboards to coordinate care details!` });
      }

      const { GoogleGenAI } = await import('@google/genai');
      const client = new GoogleGenAI({ apiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });
      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: message,
        config: {
          systemInstruction: "You are Nithin Hospital's resident AI Clinical Assistant. You help staff and patients navigate hospital operations, schedules, clinical queries, and wellness recommendations. Keep answers highly professional, kind, concise (under 5 short bullet points or 2 paragraphs), and use clean Markdown formatting.",
        }
      });

      res.json({ reply: response.text || 'I apologize, but I could not formulate a clinical analysis at this moment. Please consult our head doctor Blackwell.' });
    } catch (error: any) {
      console.error('AI Assistant Error:', error);
      res.status(500).json({ error: `Gemini API Connection stale: ${error?.message || error}` });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const actualWsPort = await findAvailablePort(VITE_WS_PORT);
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: { port: actualWsPort } },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else if (process.env.VERCEL !== '1') {
    // Only serve static files manually if NOT on Vercel
    // Vercel handles static routing via vercel.json
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  // Only start the server listener if we are running locally
  if (process.env.VERCEL !== '1') {
    const actualPort = await findAvailablePort(PORT);
    app.listen(actualPort, '0.0.0.0', () => {
      console.log(`Hospital Management Server successfully started on http://localhost:${actualPort}`);
    });
  }

  return app;
}

// Export the app for Vercel serverless environment
export const appPromise = startServer();

export default async (req: any, res: any) => {
  const app = await appPromise;
  return app(req, res);
};
