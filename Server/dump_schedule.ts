import mongoose from 'mongoose';
import DoctorScheduleModel from './src/models/doctorSchedule.model';
import dotenv from 'dotenv';
dotenv.config();

mongoose
  .connect(
    process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/clinical-intelligence',
  )
  .then(async () => {
    const all = await DoctorScheduleModel.find(
      {},
      'doctorId endDate isActive',
    ).lean();
    console.log(JSON.stringify(all, null, 2));
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
