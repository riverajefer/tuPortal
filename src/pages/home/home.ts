import { Network } from 'ionic-native';
import { Component } from '@angular/core';
import { NavController, LoadingController, AlertController, ToastController  } from 'ionic-angular';
import { LoginPage } from '../login/login';
import { Sql } from "../../providers/Sql";
import { SoapProvider } from '../../providers/soap-provider';
import { Platform } from 'ionic-angular';
declare var X2JS: any;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers:[SoapProvider]
})

export class HomePage {

  loginPage:any;
  x2 = new X2JS();
  disabled:Boolean=true;
  loading:any;
  numUsuarios:number;
  numTarias:number;

  constructor(public navCtrl: NavController, 
  public sql: Sql, 
  public soapProvider:SoapProvider, 
  public loadingCtrl: LoadingController,
  public alertCtrl: AlertController,
  public toastCtrl: ToastController,
  public platform: Platform)
  {
    
    platform.ready().then(() => {
      this.Init();
    });
  }

  Init(){

    this.loginPage = LoginPage;
    this.disabled = true;

    //this.sql.clearDropTarifas();

    this.sql.getLengthRowsT().then(resp=>{

        let countUsuarios = resp.res.rows.item(0).countUsuarios;
        console.log("#Usuarios:", countUsuarios);

        if(countUsuarios==0){

          console.log("NO hay registros");
          if (Network.connection === 'none') {
              this.msgAlert();
          }else{
            this.registroData();
          }
        }
        else{
          console.log("Si hay registros");
          if (Network.connection === 'none') {
            this.disabled = false;
            setTimeout(() => {
              this.navCtrl.push(LoginPage);
            }, 1500);            
          }
          else{
            // si hay internet y DATA
           this.clearData();
           this.registroData();
      
            // En Desarrollo
            
          /*   
           setTimeout(() => {
                this.navCtrl.push(LoginPage);
              }, 1000); 
              */

            this.disabled = false;
          }
        }
    });
  }

  clearData(){
    this.sql.clearUsers();
    this.sql.clearTarifaPlena();
  }

  msgAlert() {
    let alert = this.alertCtrl.create({
      title: 'Sin conección a Internet',
      subTitle: 'Por favor conectese a internet para descargar los datos ',
      buttons: ['Ok']
    });
    alert.present();
  }


  registroData(){
    console.log("registro de Data users");

    this.loading = this.loadingCtrl.create({
      content: 'Descargando contenido...'
    });
        
    this.loading.present();

    this.soapProvider.getUsuariosSOAP().subscribe(salida=>{
      let jsonObj = this.x2.xml_str2json( salida._body );
      
      let resulUsers = jsonObj.Envelope.Body.ConsultaUsuariosResponse.ConsultaUsuariosResult.CTSP_CONSULTA_USUARIOS_CIUDAD_Result;

      //alert(JSON.stringify(resulUsers, null, 4));

      // Descarga y Carga tarifa plena
      this.soapProvider.getTarifaPlenaSOAP().subscribe(salida=>{

        let jsonObjTPlena = this.x2.xml_str2json( salida._body );
        let resulTarifaPena = jsonObjTPlena.Envelope.Body.ConsultaTarifaPlenaResponse.ConsultaTarifaPlenaResult.CTSP_CONSULTA_CTB_TARIFA_PLENA_Result
        
        this.sql.createTarifaPlena(resulTarifaPena).then(resp=>{
          console.log("registro Tarifa plena: ", resp);
        });

      });

      // Carga Usuarios
        
      this.sql.createUser(resulUsers).then(resp=>{
        console.log("registro: ", resp);
        this.disabled = false;
        this.loading.dismiss();

        let toast = this.toastCtrl.create({
          message: 'El contenido se descargó correctamente',
          duration: 3000
        });
        toast.present();
        setTimeout(() => {
          this.navCtrl.push(LoginPage);
        }, 2000);                 

      });

    });

  }
}
