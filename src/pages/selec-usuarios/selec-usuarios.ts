import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { TarifasPage } from '../tarifas/tarifas';

@Component({
  selector: 'page-selec-usuarios',
  templateUrl: 'selec-usuarios.html'
})
export class SelectUsuariosPage {

  usuarios:number=1;
  showMas:Boolean = false;
  tarifa:string;
  campania:string;
  ciudad:string;

  constructor(public navCtrl: NavController, public navParams: NavParams, public alertCtrl: AlertController) {
     this.tarifa = navParams.get('tarifa');
     this.campania = navParams.get('campania');
     this.ciudad = navParams.get('ciudad');
  }


  less(){
    --this.usuarios;
    if(this.usuarios<1){
      this.usuarios = 1;
    }
  }

  add1(){
    this.usuarios = 1;
    this.showMas = false;
  }

  add2(){
    this.usuarios = 2;
    this.showMas = false;
  }


  add(){
    ++this.usuarios;
  }


  siguiente(){
    if(this.usuarios<1){
      this.showAlert("Ingrese un número de usuarios mayor a 1");
      this.usuarios = 1;
    }else{
      this.navCtrl.push(TarifasPage, {tarifa:this.tarifa, campania:this.campania, usuarios:this.usuarios, ciudad:this.ciudad});
    }
  }

  tresOmas(){
    this.usuarios = 3;
    this.showMas= true;
  }  

  showAlert(msg) {
    let alert = this.alertCtrl.create({
      subTitle: msg,
      buttons: ['OK']
    });
    alert.present();
  }    
}

