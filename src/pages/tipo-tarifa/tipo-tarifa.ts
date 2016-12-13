import { Component } from '@angular/core';
import { NavController, AlertController, NavParams } from 'ionic-angular';
import { SelectUsuariosPage } from '../selec-usuarios/selec-usuarios';
import { Sql } from "../../providers/Sql";

@Component({
  selector: 'page-tipo-tarifa',
  templateUrl: 'tipo-tarifa.html'
})

export class TipoTarifaPage {

  //ciudad:string    = 'Bogotá';
  ciudad:string;
  tipo_tarifas     = [];
  lista_campanias:any  = [];
  lista_estado:any = [];

  select_tarifa:string;
  select_campania:string;
  showSeleccion:Boolean = false;

  public Tarifas: Array<Object>;
  public Campanias: Array<Object>;

  constructor(public navCtrl: NavController, private sql: Sql, public alertCtrl: AlertController, public navParams: NavParams ) {

     this.ciudad = navParams.get('ciudad');

      this.sql.getTarifas(this.ciudad).then(res =>{

          // alert("Tarifas 1: "+JSON.stringify(res.res.rows.item(0), null, 4));
            let resTarifas = res.res.rows; 

            this.Tarifas = [];

            if(resTarifas.length > 0) {

                for(var i = 0; i < resTarifas.length; i++) {
                    this.lista_estado[i] = true;
                    this.Tarifas.push({
                      Tarifa: resTarifas.item(i).TIPO_TARIFA,  
                      Id: resTarifas.item(i).rowid,
                      id:i
                    });
                 }
             }     

            for(let list of this.Tarifas){

                this.sql.getCampanias(this.ciudad, list['Tarifa']).then(resC=>{

                  let resCapanias = resC.res.rows;
                  this.Campanias = [];

                  if(resCapanias.length>0){
                    for(var j = 0; j < resCapanias.length; j++) {
                      this.Campanias.push({
                        Campania: resCapanias.item(j).CAMPANA_TARIFA,  
                      });                      
                    }
                    this.lista_campanias[list['id']] = this.Campanias;
                  }

                });
            }   
            console.log("this.Tarifas: ", this.Tarifas)
            console.log("lista_estado : ", this.lista_estado)
            console.log("lista_campanias : ", this.lista_campanias)
      });
  }

  siguiente(){
    if(this.select_campania==undefined){
      this.showAlert("Por favor seleccione una campaña para continuar")
    }else{
      this.navCtrl.push(SelectUsuariosPage, {
        tarifa: this.select_tarifa,
        campania: this.select_campania,
        ciudad: this.ciudad
      });
    }
  }

  toggle(item){
    console.log(item)
    this.lista_estado[item.id] = !this.lista_estado[item.id];
  }

  selectCampania(tipo_tarifa:string, campania:string){
    this.select_tarifa   = tipo_tarifa;
    this.select_campania = campania;
    this.showSeleccion   = true;
  }

  showAlert(msg) {
    let alert = this.alertCtrl.create({
      subTitle: msg,
      buttons: ['OK']
    });
    alert.present();
  } 
}
