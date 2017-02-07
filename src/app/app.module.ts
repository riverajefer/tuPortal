import { NgModule } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';
import { TipoTarifaPage } from '../pages/tipo-tarifa/tipo-tarifa';
import { SelectUsuariosPage } from '../pages/selec-usuarios/selec-usuarios';
import { TarifasPage } from '../pages/tarifas/tarifas';
import { Sql } from "../providers/Sql";


@NgModule({
  declarations: [
    MyApp,
    HomePage,
    LoginPage,
    TipoTarifaPage,
    SelectUsuariosPage,
    TarifasPage
  ],
  imports: [
    IonicModule.forRoot(MyApp,{
      backButtonText: '',
      iconMode: 'md',
    },{})
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    LoginPage,
    TipoTarifaPage,
    SelectUsuariosPage,
    TarifasPage
  ],
  providers: [Sql]
})
export class AppModule {}
