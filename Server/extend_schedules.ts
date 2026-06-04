import mongoose from 'mongoose';
import DoctorScheduleModel from './src/models/doctorSchedule.model';
import dotenv from 'dotenv';
dotenv.config();

mongoose
  .connect(
    process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/clinical-intelligence',
  )
  .then(async () => {
    const futureDate = new Date('2026-12-31T00:00:00.000Z');
    const result = await DoctorScheduleModel.updateMany(
      {},
      { $set: { endDate: futureDate } },
    );
    console.log(
      `Updated ${result.modifiedCount} schedules to expire on Dec 31, 2026.`,
    );
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
