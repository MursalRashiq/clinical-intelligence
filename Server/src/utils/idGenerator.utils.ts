import { randomInt } from 'crypto';

export enum IDPrefix {
  DOCTOR = 'DOC',
  PATIENT = 'PAT',
  SLOT = 'SLO',
  APPOINTMENT = 'APT',
}

export class IDGenerator {
  //Generate a 6 digit random number

  private static _generateSixDigitNumber(): string {
    return randomInt(100000, 900000).toString();
  }

  //Genearte Patient ID;

  static generatePatientID(): string {
    return `${IDPrefix.PATIENT}-${this._generateSixDigitNumber()}`;
  }

  // Generate Doctor ID;

  static generateDoctorID(): string {
    return `${IDPrefix.DOCTOR}-${this._generateSixDigitNumber()}`;
  }

  static generateSlotId(): string {
    return `${IDPrefix.SLOT}${this._generateSixDigitNumber()}`;
  }

  static generateAppointmentId(): string {
    return `${IDPrefix.APPOINTMENT}${this._generateSixDigitNumber()}`;
  }
}
