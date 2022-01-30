export default class LERR_DUPLICATE_ROUTES extends Error{
    constructor(message="Duplicate routes registered"){
        super(message)
        this.name="LERR_DUPLICATE_ROUTES"
    }
}