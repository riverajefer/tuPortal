import { Component, ViewChild } from '@angular/core';
import { NavController,  Slides, NavParams } from 'ionic-angular';
import { Sql } from "../../providers/Sql";

@Component({
  selector: 'page-tarifas',
  templateUrl: 'tarifas.html'
})
export class TarifasPage {

	@ViewChild('mySlider') slider: Slides;

  mySlideOptions = {
	    initialSlide: 0,
	    loop: false,
  };

	selectedSegment:any= 0;
	slides:any;
  tarifa:string;
  campania:string;
  formaPago:string;
  valorTarifa:number;
  valorTarifaShow:number;
  usuarios:number;
  ciudad:string;
  modalidadPago:string;
  lista_modalidadPago = [];
  lista_modalidadPago2 = [];
  lista_formaValor = [];
  imgModalidad:string;
  textModalidad:string;
  showResul:Boolean=true;
  porcentajeAhorro:number;
  ahorroAnio:number;
  cuotaMes:number;
  valorIVA:number;
  TotalAPagar:number;
  IVATarifa:number;
  ordenModalidad:number;
  
  constructor(private navCtrl: NavController, public navParams: NavParams, private sql: Sql) {

     this.tarifa   = navParams.get('tarifa');
     this.campania = navParams.get('campania');
     this.usuarios = navParams.get('usuarios');
     this.ciudad = navParams.get('ciudad');
     console.log("tarifa: ",   this.tarifa);
     console.log("campania: ", this.campania);
     console.log("usuarios: ", this.usuarios);
     console.log("ciudad: ",   this.ciudad);
     
    /*setTimeout(() => {
      this.slider.slideTo(2,0);
    }, 1000);      
    */

    sql.getModalidadPago(this.ciudad, this.tarifa, this.campania).then(salida=>{

      console.log("resModalida: ", salida.res.rows);

      for(var i = 0; i < salida.res.rows.length; i++) {

        let modalidad = salida.res.rows.item(i).MODALIDAD_PAGO;
        if(modalidad=='Cuenta bancaria'){
          this.imgModalidad = 'debito.png';
          this.textModalidad=modalidad;
          this.ordenModalidad = 1;
        }
        else if(modalidad=='Efectivo' || modalidad== 'Aviso de Pago'){
          this.imgModalidad = 'aviso.png';
          this.textModalidad=modalidad;
          this.ordenModalidad = 2;
        }
        else if(modalidad == 'Tarjeta de Crédito'){
          this.imgModalidad = 'credito.png';
          this.textModalidad=modalidad;
          this.ordenModalidad = 0;
        }
        else{
          this.imgModalidad = 'aviso.png';
          this.textModalidad=modalidad;
          this.ordenModalidad = 2;
        }

        this.lista_modalidadPago.push({
            modalidad: modalidad,
            id:i,
            formaPago:salida.res.rows.item(i).FORMA_PAGO,
            valorTarifa:salida.res.rows.item(i).VALOR_TARIFA,
            imgModalidad:this.imgModalidad,
            textModalidad:this.textModalidad,
            ordenModalidad:this.ordenModalidad
        });
        //this.lista_modalidadPago = this.lista_modalidadPago.reverse();
      }

      let resModalidad = salida.res.rows.item(0);
      console.log("Modalidad: ", resModalidad);

      this.modalidadPago = resModalidad.MODALIDAD_PAGO;

      sql.getPagoTarifas(this.ciudad, this.tarifa, this.campania, this.modalidadPago, this.usuarios).then(salida=>{
        console.log("resPagoTarifa: ", salida.res.rows );

        let resPagoTarifa = salida.res.rows.item(0); 
        let selected = false;

        for(var i = 0; i < salida.res.rows.length; i++) {
          if(i==0){
            selected = true;
          }else{
            selected = false;
          }          

          this.lista_formaValor.push({
              formaPago: salida.res.rows.item(i).FORMA_PAGO,
              valor:salida.res.rows.item(i).VALOR_TARIFA,
              valorShow:this.formatMoney(salida.res.rows.item(i).VALOR_TARIFA),
              IvaTarifa:salida.res.rows.item(i).VALOR_IVA_TARIFA,
              selected:selected
          });
        }
        console.log("MODALIDAD pago : ", this.modalidadPago);

        this.seleccion("Anual", salida.res.rows.item(0).VALOR_TARIFA, this.modalidadPago, salida.res.rows.item(0).VALOR_IVA_TARIFA);

        this.formaPago   = resPagoTarifa.FORMA_PAGO;
        this.valorTarifa = this.formatMoney(resPagoTarifa.VALOR_TARIFA);
        
      });
    });
    console.log("lista_modalidadPago: ", this.lista_modalidadPago);
    //this.lista_modalidadPago2 = this.lista_modalidadPago.sort(this.compare);
    this.lista_modalidadPago  = this.lista_modalidadPago.slice(0);
    this.lista_modalidadPago2 = this.lista_modalidadPago.sort(function(a,b) {
        return a.ordenModalidad - b.ordenModalidad;
    });

    console.log("lista_modalidadPago2: ", this.lista_modalidadPago2);


    this.selectedSegment = '0';
   
  }

 compare(a,b) {
  if (a.ordenModalidad < b.ordenModalidad)
    return -1;
  if (a.ordenModalidad > b.ordenModalidad)
    return 1;
  return 0;
}
  



  onSegmentChanged(segmentButton) {
    console.log("segmentButton: ", segmentButton)
    this.slider.slideTo(segmentButton);
  }

  onSlideChanged(slider) {
    
    let currentIndex = this.slider.getActiveIndex();
    console.log("Current index is", currentIndex);
    this.selectedSegment = currentIndex;

    const currentSlide = this.lista_modalidadPago[slider.activeIndex];
    console.log("currentSlide Mo: ",currentSlide.modalidad)
    
    this.selectedSegment = currentSlide.id;

      this.sql.getPagoTarifas(this.ciudad, this.tarifa, this.campania, currentSlide.modalidad, this.usuarios).then(salida=>{
        console.log("resPagoTarifa Slide: ", salida.res.rows );

        let resPagoTarifa = salida.res.rows.item(0);
        this.lista_formaValor = []; 
        let selected = false;

        for(var i = 0; i < salida.res.rows.length; i++) {

          if(i==0){
            selected = true;
          }else{
            selected = false;
          }

          this.lista_formaValor.push({
              formaPago: salida.res.rows.item(i).FORMA_PAGO,
              valor:salida.res.rows.item(i).VALOR_TARIFA,
              valorShow:this.formatMoney(salida.res.rows.item(i).VALOR_TARIFA),
              IvaTarifa:salida.res.rows.item(i).VALOR_IVA_TARIFA,
              selected:selected
          });
        }

        this.seleccion("Anual", salida.res.rows.item(0).VALOR_TARIFA, currentSlide.modalidad, salida.res.rows.item(0).VALOR_IVA_TARIFA);
        this.formaPago   = resPagoTarifa.FORMA_PAGO;
        this.valorTarifa = this.formatMoney(resPagoTarifa.VALOR_TARIFA);
      });
  }  

  seleccion(formaPago, valor, modalidad, IvaTarifa){

    this.showResul = true;
    this.formaPago = formaPago;
    this.valorTarifa = this.formatMoney(valor);
    this.modalidadPago = modalidad;

    if(modalidad=='Cuenta bancaria'){
      this.imgModalidad = 'debito.png';
    }
    else if(modalidad=='Efectivo' || modalidad== 'Aviso de Pago'){
      this.imgModalidad = 'aviso.png';
    }
    else if(modalidad == 'Tarjeta de Crédito'){
      this.imgModalidad = 'credito.png';
    }
    else{
      this.imgModalidad = 'aviso.png';
    }

    this.sql.getTarifaPlena(this.ciudad).then(resp=>{

      let valorTarifaPlena = resp.res.rows.item(0).TARIFA_PLENA;
      this.porcentajeAhorro = ( ( valor/valorTarifaPlena ) - 1 )*-100;
      this.porcentajeAhorro =  Math.round(this.porcentajeAhorro * 100) / 100;

      this.ahorroAnio = this.formatMoney((valorTarifaPlena*12)-(valor*12));
      let cuotaMes = valor*this.usuarios;
      this.cuotaMes = this.formatMoney(valor*this.usuarios);
      
      let IVATARIFA  = IvaTarifa*this.usuarios;
      this.IVATarifa  = this.formatMoney(IvaTarifa*this.usuarios);
      
      this.TotalAPagar = this.formatMoney(cuotaMes + IVATARIFA);
    });
  }

  formatMoney(n):any {
      return "$ " + Number(n.toFixed(1)).toLocaleString()
  }

}


