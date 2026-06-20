class Apierror extends Error{
    constructor(statuscode,message){
        super();
        this.statuscode = statuscode,
        this.message = message
    }
}

export {Apierror};