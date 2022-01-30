import Application from "./Application";

interface PluginOptions{
    prefix?:string
}

export default class Plugin extends Application{
    public global:boolean=false
    constructor(opts?:PluginOptions){
        super()
    }

    // Override signature hints
    preLoad(){}
    onLoad(){}

    register(){}
}