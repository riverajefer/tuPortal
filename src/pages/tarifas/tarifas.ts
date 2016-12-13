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
	sliderComponent:any;

  tarifa:string;
  campania:string;
  formaPago:string;
  valorTarifa:string;  
  usuarios:number;
  //ciudad:string = "Bogotá";
  ciudad:string;
  modalidadPago:string;
  lista_modalidadPago = [];
  lista_formaValor = [];
  idModalidad:any;
  imgModalidad:string;
  textModalidad:string;
  showResul:Boolean=false;
  rango:string;
  

  constructor(private navCtrl: NavController, public navParams: NavParams, private sql: Sql) {

     this.tarifa   = navParams.get('tarifa');
     this.campania = navParams.get('campania');
     this.usuarios = navParams.get('usuarios');
     this.ciudad = navParams.get('ciudad');
     
     console.log("tarifa: ",   this.tarifa);
     console.log("campania: ", this.campania);
     console.log("usuarios: ", this.usuarios);
     console.log("ciudad: ",   this.ciudad);

     sql.getRangoFinal(this.ciudad, this.tarifa, this.campania, this.usuarios).then(salida=>{

       this.rango = salida.res.rows.item(0).rango;
       console.log("Rango: ", this.rango);

       sql.getModalidadPago(this.ciudad, this.tarifa, this.campania, this.rango).then(salida=>{

         console.log("resModalida: ", salida.res.rows);

          for(var i = 0; i < salida.res.rows.length; i++) {

            let modalidad = salida.res.rows.item(i).MODALIDAD_PAGO;
            if(modalidad=='Cuenta bancaria'){
              this.imgModalidad = 'icon_debito.png';
              this.textModalidad='Tarjeta Débito';
            }
            else if(modalidad=='Efectivo' || modalidad== 'Aviso de Pago'){
              this.imgModalidad = 'icon_factura.png';
              this.textModalidad='Factura';
            }
            else if(modalidad == 'Tarjeta de Crédito'){
              this.imgModalidad = 'icon_credito.png';
              this.textModalidad='TARJETA DE CRÉDITO';
            }
            else{
              this.imgModalidad = 'icon_factura.png';
              this.textModalidad='Factura';
            }
            this.lista_modalidadPago.push({
                modalidad: modalidad,
                id:i,
                formaPago:salida.res.rows.item(i).FORMA_PAGO,
                valorTarifa:salida.res.rows.item(i).VALOR_TARIFA,
                imgModalidad:this.imgModalidad,
                textModalidad:this.textModalidad
            });
          }

         let resModalidad = salida.res.rows.item(0);
         console.log("Modalidad: ", resModalidad);

         this.modalidadPago = resModalidad.MODALIDAD_PAGO;
         this.idModalidad = resModalidad.rowid;

        console.log("modalidadPago: ", this.modalidadPago);

         sql.getPagoTarifa(this.ciudad, this.tarifa, this.campania, this.rango, this.modalidadPago).then(salida=>{
           console.log("resPagoTarifa: ", salida.res.rows );

           let resPagoTarifa = salida.res.rows.item(0); 

           for(var i = 0; i < salida.res.rows.length; i++) {

              this.lista_formaValor.push({
                  formaPago: salida.res.rows.item(i).FORMA_PAGO,
                  valor:salida.res.rows.item(i).VALOR_TARIFA,
              });

           }

           this.formaPago   = resPagoTarifa.FORMA_PAGO;
           this.valorTarifa = resPagoTarifa.VALOR_TARIFA;
           console.log("Forma Pago ",   this.formaPago);
           console.log("Valor Tarifa ", this.valorTarifa);

         });


       });


     });

     console.log("lista_modalidadPago : ", this.lista_modalidadPago);
     console.log("lista_formaValor : ", this.lista_formaValor);
     
     this.selectedSegment = '0';
  }


  onSegmentChanged(segmentButton, modalidad) {
    console.log("modalidad:", modalidad );
    this.slider.slideTo(segmentButton);
  }

  onSlideChanged(slider) {

    let currentIndex = this.slider.getActiveIndex();
    console.log("Current index is", currentIndex);
    this.selectedSegment = currentIndex;

    console.log('Slide changed', slider);
    
    const currentSlide = this.lista_modalidadPago[slider.activeIndex];
    console.log("currentSlide Mo: ",currentSlide.modalidad)
    this.selectedSegment = currentSlide.id;


         this.sql.getPagoTarifa(this.ciudad, this.tarifa, this.campania, this.rango, currentSlide.modalidad).then(salida=>{
           console.log("resPagoTarifa Slide: ", salida.res.rows );

           let resPagoTarifa = salida.res.rows.item(0);
           this.lista_formaValor = []; 

           for(var i = 0; i < salida.res.rows.length; i++) {

              this.lista_formaValor.push({
                  formaPago: salida.res.rows.item(i).FORMA_PAGO,
                  valor:salida.res.rows.item(i).VALOR_TARIFA,
              });

           }

           this.formaPago   = resPagoTarifa.FORMA_PAGO;
           this.valorTarifa = resPagoTarifa.VALOR_TARIFA;
           console.log("Forma Pago ",   this.formaPago);
           console.log("Valor Tarifa ", this.valorTarifa);

         });


    ///console.log("Current index s2", currentSlide.id);
  }  

  seleccion(formaPago, valor, modalidad){
    this.showResul = true;
    console.log("formaPago: ", formaPago);
    this.formaPago = formaPago;
    console.log("valor: ", valor);
    this.valorTarifa = valor;
    console.log("modalidad: ", modalidad);
    this.modalidadPago = modalidad;

  }

  onSegmentChanged2(segmentButton) {
    //console.log("this.selectedSegment", this.selectedSegment);
    const selectedIndex = this.slides.findIndex((slide) => {
      return slide.id === this.selectedSegment;
    });
    //console.log(selectedIndex);
    this.slider.slideTo(selectedIndex);
  }

  onSlideChanged2(slider) {

    let currentIndex = this.slider.getActiveIndex();
    //console.log("Current index is", currentIndex);
    this.selectedSegment = currentIndex;

    //console.log('Slide changed', slider);
    
    const currentSlide = this.slides[slider.activeIndex];
    this.selectedSegment = currentSlide.id;
    //console.log("Current index s2", currentSlide.id);
  }  

}


