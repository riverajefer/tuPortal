import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/Rx';


@Injectable()
export class SoapProvider {

  //URL:string = 'http://csemermedica.cloudapp.net:8080/EmermedicaWebService/WebServiceEmermedicaCotizador.asmx';
  //URL:string = 'http://192.168.10.119:8080/wscotizador/WebServiceEmermedicaCotizador.asmx';
  URL:string = 'http://herramientascomerciales.emermedica.com.co:8080/wscotizador/WebServiceEmermedicaCotizador.asmx';
  body_users:string;
  body_tarifas:string;
  body_tarifa_plena:string;

  constructor(public http: Http) {

    this.body_users = '<x:Envelope xmlns:x="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/"><x:Header><tem:AuthHeader><tem:Usuario>usuario</tem:Usuario><tem:Password>contrasena</tem:Password></tem:AuthHeader></x:Header><x:Body><tem:ConsultaUsuarios/></x:Body></x:Envelope>';

    this.body_tarifas = '<x:Envelope xmlns:x="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/"><x:Header><tem:AuthHeader><tem:Usuario>usuario</tem:Usuario><tem:Password>contrasena</tem:Password></tem:AuthHeader></x:Header><x:Body><tem:ConsultaTarifasCampanas><tem:ciudad>Cali</tem:ciudad></tem:ConsultaTarifasCampanas></x:Body></x:Envelope>';

    this.body_tarifa_plena = '<x:Envelope xmlns:x="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/"><x:Header><tem:AuthHeader><tem:Usuario>usuario</tem:Usuario><tem:Password>contrasena</tem:Password></tem:AuthHeader></x:Header><x:Body><tem:ConsultaTarifaPlena><tem:Ciudad></tem:Ciudad></tem:ConsultaTarifaPlena></x:Body></x:Envelope>';    
  
}

  bodyTarifas(ciudad:string):string{
    return  this.body_tarifas = '<x:Envelope xmlns:x="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/"><x:Header><tem:AuthHeader><tem:Usuario>usuario</tem:Usuario><tem:Password>contrasena</tem:Password></tem:AuthHeader></x:Header><x:Body><tem:ConsultaTarifasCampanas><tem:ciudad>'+ciudad+'</tem:ciudad></tem:ConsultaTarifasCampanas></x:Body></x:Envelope>';
  }

  getUsuariosSOAP():any{
    let headers = new Headers({ 'Content-Type': 'text/xml; charset=utf-8', 'SOAPAction':'http://tempuri.org/ConsultaUsuarios' });
    return this.http.post(this.URL, this.body_users, {headers: headers}).map(this.extractDataSoap).catch(this.handleError); 
  }

  getTarifasSOAP():any{
    let headers = new Headers({ 'Content-Type': 'text/xml; charset=utf-8', 'SOAPAction':'http://tempuri.org/ConsultaTarifasCampanas' });
    return this.http.post(this.URL, this.body_tarifas, {headers: headers}).map(this.extractDataSoap).catch(this.handleError); 
  }

  getTarifasPorCiudadSOAP(ciudad:string):any{
    let headers = new Headers({ 'Content-Type': 'text/xml; charset=utf-8', 'SOAPAction':'http://tempuri.org/ConsultaTarifasCampanas' });
    return this.http.post(this.URL, this.bodyTarifas(ciudad), {headers: headers}).map(this.extractDataSoap).catch(this.handleError); 
  }

  getTarifaPlenaSOAP():any{
    let headers = new Headers({ 'Content-Type': 'text/xml; charset=utf-8', 'SOAPAction':'http://tempuri.org/ConsultaTarifaPlena' });
    return this.http.post(this.URL, this.body_tarifa_plena, {headers: headers}).map(this.extractDataSoap).catch(this.handleError); 
  }

  private extractDataSoap(res: Response){
      let body = res;
      //console.log(body)
      return body || {};
  }

  private handleError (error: any) {
    let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console instead
    return Observable.throw(errMsg);
  }  

}
