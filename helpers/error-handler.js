function errorHandler(err, req, res, next){

    if(err.name == 'UnauthorizedError'){

        return res.status(401).json({
            message: `The user is not not authenticated`,
            error: err
        });

    }

    if(err.name == 'ValidationError'){

        return res.status(401).json({
            message: `There was a validation error`,
            error: err
        });

    }

    return res.status(500).json({
        message: `The server encounted an error`,
        error: err
    });

}

module.exports = errorHandler;