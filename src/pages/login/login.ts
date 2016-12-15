import { Network } from 'ionic-native';
import { Component } from '@angular/core';
import { NavController, AlertController, LoadingController } from 'ionic-angular';
import { TipoTarifaPage } from '../tipo-tarifa/tipo-tarifa';
import { Sql } from "../../providers/Sql";
import { SoapProvider } from '../../providers/soap-provider';
declare var X2JS: any;

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
  providers:[SoapProvider]
})
export class LoginPage {

  login:any;
  x2 = new X2JS();
  loading:any;
  disabled:Boolean=true;

  constructor(
    public navCtrl: NavController, 
    private sql: Sql, 
    public alertCtrl: AlertController,
    public soapProvider:SoapProvider,
    public loadingCtrl:LoadingController
    ) {
    
    /*this.login = {
      user: 'admin',
      password: '123'
    };*/
    
    this.login = {};


  }

  loginForm(event){
    event.preventDefault();

    this.sql.login(this.login.user, this.login.password).then(salida=>{
      console.log("salida login: ", salida.res.rows);
      let resLogin = salida.res.rows;

      if(resLogin.length>0){
        console.log("Prepagra regitro");
        let ciudad = resLogin.item(0).ciudad;
        console.log("Ciudad: ", ciudad);
        this.preparaRegistro(ciudad);

      }else{
        this.showAlert("Usuario o contraseña incorrectos");
      }
    });
  }


  preparaRegistro(ciudad:string):void{

    this.sql.getLengthRowsTarifas().then(resp=>{

        let countTarifas  = resp.res.rows.item(0).count;
        console.log("#Tarifas:", countTarifas);

        if(countTarifas==0){

          console.log("NO hay registros");
          if (Network.connection === 'none') {
              this.msgAlert();
          }else{
            this.registroData(ciudad);
          }
        }
        else{
          console.log("Si hay registros");
          if (Network.connection === 'none') {
            this.disabled = false;
            this.navCtrl.push(TipoTarifaPage, {ciudad: ciudad });
          }
          else{
            // si hay internet y DATA
            this.clearData();
            this.registroData(ciudad);
            this.disabled = false;
            //this.navCtrl.push(TipoTarifaPage, {ciudad: ciudad });
          }
        }
    });
  }

  registroData(ciudad:string):void{

    this.loading = this.loadingCtrl.create({
      content: 'Descargando contenido...'
    });
        
    this.loading.present();
    console.log("ciuadad 2 ", ciudad)

    this.soapProvider.getTarifasPorCiudadSOAP(ciudad).subscribe(salida=>{
      let jsonObj = this.x2.xml_str2json( salida._body );
      let tariasObject =  jsonObj.Envelope.Body.ConsultaTarifasCampanasResponse.ConsultaTarifasCampanasResult.CTSP_CONSULTA_CTB_TARIFAS_CAMPANA_Result;
      //console.log("tariasObject: ", tariasObject);
      
      this.sql.createTarifa(tariasObject).then(resp=>{
        console.log("registro Tarifas: ", resp);
        this.disabled = false;
        this.loading.dismiss();

        let alert = this.alertCtrl.create({
          subTitle: 'El contenido se descargo correctamente',
          buttons: ['Ok']
        });

        alert.present();
        this.navCtrl.push(TipoTarifaPage, {ciudad: ciudad });

      });
    });
  }

  showAlert(msg) {
    let alert = this.alertCtrl.create({
      title: 'Error !',
      subTitle: msg,
      buttons: ['OK']
    });
    alert.present();
  }  

  clearData(){
    this.sql.clearTarifas();
  }

  msgAlert() {
    let alert = this.alertCtrl.create({
      title: 'Sin conección a Internet',
      subTitle: 'Por favor conectese a internet para descargar los datos ',
      buttons: ['Ok']
    });
    alert.present();
  }

}
