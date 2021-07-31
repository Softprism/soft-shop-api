import express from 'express';
import * as storeService from '../services/store.service.js';
import jwt from 'jsonwebtoken';
import { auth } from '../middleware/auth.js';
import { check, validationResult } from 'express-validator';

const getStores = async (req, res, next) => {
	const stores = await storeService.getStores();

	stores && stores.length > 0
		? res.status(200).json({ success: true, result: stores })
		: res.status(404).json({ success: false, msg: 'No Store found' });
};

const createStore = async (req, res, next) => {
  // verifiy permission
  if(req.admin === undefined && req.store === undefined) return res.status(403).json({ success: false, msg: 'you\'re not permiited to carry out this action' })
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		let error_msgs = [];
		errors.array().forEach((element) => {
			error_msgs = [...error_msgs, element.msg];
		});
		return res.status(400).json({
			success: false,
			errors: error_msgs,
		});
	}

	const store = await storeService.createStore(req.body);

	if (store.err) {
		res.status(500).json({ success: false, msg: store.err });
	} else {
    res.status(200).json({ success: true, result: store });
  }

};

const loginStore = async (req, res, next) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		res.status(400).json({
			success: false,
			errors: errors,
		});
	}

	const store = await storeService.loginStore(req.body);

	if (store.err) {
		res.status(500).json({ success: false, msg: store.err });
	} else {
    res.status(200).json({ success: true, result: store });
  }

};

const getLoggedInStore = async (req, res, next) => {
	// Call Get Logged in User function from userService
	const store = await storeService.getLoggedInStore(req.store.id);

	if (store.err) {
		res.status(500).json({ success: false, msg: store.err });
	} else {
    res.status(200).json({
      success: true,
      result: store,
    });
  }
};

const updateStore = async (req, res, next) => {
  // verifiy permission
  if(req.admin === undefined && req.store === undefined) return res.status(403).json({ success: false, msg: 'you\'re not permiited to carry out this action' })

	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		res.status(400).json({
			success: false,
			errors: errors.array()['msg'],
		});
	}
  let storeID;
	if (req.store === undefined && req.query.storeID === undefined) {
		res
			.status(400)
			.json({ success: false, msg: 'unable to authenticate this user' });
	}
	if (req.store) storeID = req.store.id;
	if (req.query.storeID && req.admin) storeID = req.query.storeID;

	const store = await storeService.updateStore(storeID, req.body);

	if (store.err) {
		res.status(500).json({ success: false, msg: store.err });
	} else {
    res.status(200).json({ success: true, result: store });
  }

};

export { getStores, createStore, loginStore, getLoggedInStore, updateStore };
