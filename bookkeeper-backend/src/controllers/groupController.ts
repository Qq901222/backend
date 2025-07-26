import { Request, Response } from 'express';
import mongoose from 'mongoose'; 
import Group from '../models/Group';

// 建立群組
export const createGroup = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { name } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const group = await Group.create({
      name,
      members: [{ user: userId, role: 'admin' }],
    });

    res.status(201).json(group);
  } catch (error) {
    console.error('Create Group Error:', error);
    res.status(500).json({ message: 'Server Error', error });
  }
};

// 查看群組
export const getGroups = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    const groups = await Group.find({ 'members.user': userId })
      .populate('members.user', 'name email');

    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get groups', error });
  }
};

// 更新群組成員
export const updateGroupMembers = async (req: Request, res: Response) => {
  try {
    const groupId = req.params.id;
    const { members } = req.body;

    if (!Array.isArray(members)) {
      return res.status(400).json({ message: 'members 必須是陣列' });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: '找不到群組' });
    }

    group.members = members;
    await group.save();

    res.json({ message: '群組成員更新成功', group });
  } catch (error) {
    console.error('更新群組失敗', error);
    res.status(500).json({ message: '伺服器錯誤', error });
  }
};

// 加入群組（使用目前登入者）
export const joinGroup = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const groupId = req.params.id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: '找不到群組' });
    }

    const isAlreadyMember = group.members.some(
      (m) => m.user.toString() === userId
    );
    if (isAlreadyMember) {
      return res.status(400).json({ message: '你已經在群組中' });
    }

    group.members.push({
      user: new mongoose.Types.ObjectId(userId),
      role: 'member',
    });

    await group.save();
    res.json({ message: '成功加入群組', group });
  } catch (error) {
    console.error('加入群組失敗', error);
    res.status(500).json({ message: '伺服器錯誤', error });
  }
};

// 手動加入指定使用者到群組（for 測試）
export const addGroupMember = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: '無效的 ID' });
    }

    const group = await Group.findById(id);
    if (!group) return res.status(404).json({ message: '找不到群組' });

    const alreadyIn = group.members.some(member => member.user.toString() === userId);
    if (alreadyIn) {
      return res.status(400).json({ message: '使用者已在群組中' });
    }

group.members.push({ user: new mongoose.Types.ObjectId(userId), role: 'member' });
    await group.save();

    res.json({ message: '已加入群組', group });
  } catch (err) {
    console.error('加入群組失敗:', err);
    res.status(500).json({ message: '伺服器錯誤', error: err });
  }
};
