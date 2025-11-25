import mongoose, { Document, Model, Types } from 'mongoose';
import { IUser } from './User.model';
export interface ITask extends Document {
    _id: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    priority: 'low' | 'medium' | 'high';
    status: 'todo' | 'inprogress' | 'done';
    dueDate?: Date;
    tags: string[];
    orderIndex: number;
    isCompleted: boolean;
    ownerId: Types.ObjectId;
    owner?: IUser;
    createdAt: Date;
    updatedAt: Date;
}
declare const Task: Model<ITask>;
export default Task;
//# sourceMappingURL=Task.model.d.ts.map