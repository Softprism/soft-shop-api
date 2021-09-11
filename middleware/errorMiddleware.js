const errorHandler = (err, req, res, next) => {
	if (typeof err === 'string') {
		// custom application error
    console.log(2)
		return res.status(400).json({ success: false, msg: err });
	}

	if (err.name === 'ValidationError') {
		// mongoose validation error
    console.log(2)
		return res.status(400).json({ success: false, msg: err.message });
	}

	if (err.name === 'UnauthorizedError') {
		// jwt authentication error
    console.log(2)
		return res.status(401).json({ success: false, msg: 'Invalid Token' });
	}

	// default to 500 server error
  console.log(2)
	return res.status(500).json({ success: false, msg : err.message });
};

export { errorHandler };
