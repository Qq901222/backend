import mongoose from 'mongoose';

const unclassifiedNoteSchema = new mongoose.Schema(
  {
    note: { type: String, required: true },
  },
  { timestamps: true }
);

const UnclassifiedNote = mongoose.model('UnclassifiedNote', unclassifiedNoteSchema);

export default UnclassifiedNote;
