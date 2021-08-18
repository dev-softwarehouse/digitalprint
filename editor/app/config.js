export class Config {

	constructor( domain, port, companyID, frameworkUrl){

		this.domain = domain.replace(/"/g, "");
		this.port = port;
		this.companyID = companyID;
		this.frameworkUrl = frameworkUrl.replace(/"/g, "");

	}

	getPort(){

		return this.port;

	};

	getDomain(){

		return this.domain;

	};

	getCompanyID (){

		return this.companyID;

	};

	getFrameworkUrl(){

		return this.frameworkUrl;

	};


}
