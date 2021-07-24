import express from 'express';
import { validationResult } from 'express-validator';
import { auth } from '../middleware/auth.js';

import * as userService from '../services/user.service.js';

const router = express.Router();

const getUsers = async (req, res) => {
	const users = await userService.getUsers();

	users && users.length > 0
		? res.status(200).json(users)
		: res.status(404).json({ msg: 'No Users found' });
};

const registerUser = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		res.status(400).json({ errors: errors.array() });
	}

	const token = await userService.registerUser(req.body);

	if (token.err) {
		res.status(500).json({ success: false, msg: token.err });
	}

	res.status(201).json({ success: true, result: token });
};

const loginUser = async (req, res, next) => {
	const errors = validationResult(req);
	console.log(req.body);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	// Call Login function from userService
	const token = await userService.loginUser(req.body);

	if (token.err) {
		res.status(500).json({ success: false, msg: token.err });
	}

	res.status(200).json({
		success: true,
		result: token,
	});
};

const getLoggedInUser = async (req, res, next) => {
	// Call Get Logged in User function from userService
	const user = await userService.getLoggedInUser(req.user.id);

	console.log(user);

	if (user.err) {
		res.status(500).json({ success: false, msg: user.err });
	}

	res.status(200).json({
		success: true,
		user: user,
	});
};

const updateUser = async (req, res) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	const user = await userService.updateUser(req.body, req.params.id);

	if (user.err) {
		res.status(500).json({ success: false, msg: user.err });
	}

	res.status(200).json({
		success: true,
		user: user,
	});
};

export { getUsers, registerUser, loginUser, getLoggedInUser, updateUser };
