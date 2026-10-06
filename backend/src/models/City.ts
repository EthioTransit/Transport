import mongoose, { Document, Schema } from 'mongoose';

export interface ICity extends Document {
  name: string;
  amharicName?: string;
  region: string;
  country: string;
  code: string;
  status: 'ACTIVE' | 'INACTIVE';
  terminalName?: string;
  image?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const CitySchema = new Schema<ICity>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    amharicName: { type: String, trim: true },
    region: { type: String, required: true, trim: true },
    country: { type: String, default: 'Ethiopia' },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
    terminalName: { type: String, trim: true },
    image: { type: String, trim: true },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  { timestamps: true }
);

CitySchema.index({ name: 'text', amharicName: 'text', region: 'text' });
CitySchema.index({ status: 1 });

export const City = mongoose.model<ICity>('City', CitySchema);
