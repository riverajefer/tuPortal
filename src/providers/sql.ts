import {Injectable} from "@angular/core";

const DB_NAME: string = '__ionicstorage';
const win: any = window;

@Injectable()
export class Sql {
    private _db: any;

    constructor() {
        if (win.cordova) {
            this._db = win.sqlitePlugin.openDatabase({
                name: DB_NAME,
                key:'123',
                location: 2,
                createFromLocation: 0
            });
           // alert("open win.sqlitePlugin ")

        } else {
            //alert("SQLite plugin not installed ")
            console.warn('Storage: SQLite plugin not installed, falling back to WebSQL. Make sure to install cordova-sqlite-storage in production!');

            this._db = win.openDatabase(DB_NAME, '1.0', 'database', 5 * 1024 * 1024);
        }
        this._tryInit();
    }

    // Initialize the DB with our required tables
    _tryInit() {
        this.query('CREATE TABLE IF NOT EXISTS kv (key text primary key, value text)').catch(err => {
            console.error('Storage: Unable to create initial storage tables', err.tx, err.err);
        });

        this.query('CREATE TABLE IF NOT EXISTS Usuarios (key text primary key, usuario text, contrasena text, ciudad text, estado integer)').catch(err => {
            console.error('Storage: Unable to create initial storage tables', err.tx, err.err);
        });

        this.query('CREATE TABLE IF NOT EXISTS Tarifas (key text primary key, TIPO_TARIFA text, CAMPANA_TARIFA text, CIUDAD text, RANGO_INICIAL_PERSONA integer, RANGO_FINAL_PERSONA integer, MODALIDAD_PAGO text, FORMA_PAGO NUMERIC(18,0), VALOR_TARIFA NUMERIC(18,0), VALOR_IVA_TARIFA NUMERIC(18,0), FECHA_VENCIMIENTO_TARIFA text, ID_ESTADO integer, ORDEN integer)').catch(err =>{
            console.error('Storage: Unable to create initial storage tables', err.tx, err.err);
        });

        this.query('CREATE TABLE IF NOT EXISTS TarifaPlena (key text primary key, CIUDAD text, TARIFA_PLENA text )').catch(err =>{
            console.error('Storage: Unable to create initial storage tables', err.tx, err.err);
        });

    }

    /**
     * Perform an arbitrary SQL operation on the database. Use this method
     * to have full control over the underlying database through SQL operations
     * like SELECT, INSERT, and UPDATE.
     *
     * @param {string} query the query to run
     * @param {array} params the additional params to use for query placeholders
     * @return {Promise} that resolves or rejects with an object of the form { tx: Transaction, res: Result (or err)}
     */
    query(query: string, params: any[] = []): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                this._db.transaction((tx: any) => {
                        tx.executeSql(query, params,
                            (tx: any, res: any) => resolve({ tx: tx, res: res }),
                            (tx: any, err: any) => reject({ tx: tx, err: err }));
                    },
                    (err: any) => reject({ err: err }));
            } catch (err) {
                reject({ err: err });
            }
        });
    }

    /**
     * Get the value in the database identified by the given key.
     * @param {string} key the key
     * @return {Promise} that resolves or rejects with an object of the form { tx: Transaction, res: Result (or err)}
     */
    get(key: string): Promise<any> {
        return this.query('select key, value from kv where key = ? limit 1', [key]).then(data => {
            if (data.res.rows.length > 0) {
                return data.res.rows.item(0).value;
            }
        });
    }



    /**
     * Set the value in the database for the given key. Existing values will be overwritten.
     * @param {string} key the key
     * @param {string} value The value (as a string)
     * @return {Promise} that resolves or rejects with an object of the form { tx: Transaction, res: Result (or err)}
     */
    set(key: string, value: string): Promise<any> {
        return this.query('insert or replace into kv(key, value) values (?, ?)', [key, value]);
    }

    createUser(User:any):Promise<any>{
        let c = 1;
        for (let usuario of User) {
            this.query("INSERT OR REPLACE INTO Usuarios(key, usuario, contrasena, ciudad, estado) VALUES ("+c+",'"+usuario.USUARIO+"', '"+usuario.CONTRASENA+"', '"+usuario.CIUDAD+"', "+usuario.ESTADO+")").then(salida=>{
            });
            c++;
        }
        return this.query('SELECT * FROM Usuarios');
    }

    createTarifa(Tarifa:any):Promise<any>{
        let c=1;
        let orden;
        for (let tarifa of Tarifa){
            switch (tarifa.FORMA_PAGO){
                case "Anual":{
                    orden=1;
                    break;
                }
                case "Semestral":{
                    orden=2;
                    break;
                }
                case "Trimestral":{
                    orden=3;
                    break;
                }
                case "Mensual":{
                    orden=4;
                    break;
                }
                default:{
                    orden=5;
                    break;
                }                                       
                
            }

            this.query("INSERT INTO Tarifas(key, CAMPANA_TARIFA, CIUDAD, FECHA_VENCIMIENTO_TARIFA, FORMA_PAGO, ID_ESTADO, MODALIDAD_PAGO, RANGO_FINAL_PERSONA, RANGO_INICIAL_PERSONA, TIPO_TARIFA, VALOR_IVA_TARIFA, VALOR_TARIFA, ORDEN) VALUES("+c+", '"+tarifa.CAMPANA_TARIFA+"', '"+tarifa.CIUDAD+"', '"+tarifa.FECHA_VENCIMIENTO_TARIFA+"', '"+tarifa.FORMA_PAGO+"', '"+tarifa.ID_ESTADO+"', '"+tarifa.MODALIDAD_PAGO+"', '"+tarifa.RANGO_FINAL_PERSONA+"', '"+tarifa.RANGO_INICIAL_PERSONA+"', '"+tarifa.TIPO_TARIFA+"', '"+tarifa.VALOR_IVA_TARIFA+"', '"+tarifa.VALOR_TARIFA+"', '"+orden+"')" ).catch(err =>{
                console.error('Storage: Unable to create initial storage tables', err.tx, err.err);
            });
            c++;
        }
       return this.query('SELECT * FROM Tarifas');
    }

    createTarifaPlena(TarifaPlena:any):Promise<any>{
        let c = 1;
        for (let tarifaPlena of TarifaPlena) {
            this.query("INSERT OR REPLACE INTO TarifaPlena(key, CIUDAD, TARIFA_PLENA) VALUES ("+c+",'"+tarifaPlena.CIUDAD+"', '"+tarifaPlena.TARIFA_PLENA+"')").then(salida=>{
            });
            c++;
        }
        return this.query('SELECT * FROM TarifaPlena');
    }


    getLengthRows():Promise<any>{
        return this.query('SELECT SUM(c) as count FROM (SELECT COUNT(*) AS c FROM Tarifas UNION ALL SELECT COUNT(*) FROM Usuarios); ');
    }

    getLengthRowsT():Promise<any>{
        return this.query('SELECT (select count(*) from Tarifas) as countTarifas, (select count(*) from Usuarios) as countUsuarios');
    }
    getLengthRowsTarifas():Promise<any>{
        return this.query('SELECT COUNT(*) AS count FROM Tarifas');
    }

    getLengthRowsUsuarios():Promise<any>{
        return this.query('SELECT COUNT(*) AS count FROM Usuarios');
    }    

    login(user:string, password:string): Promise<any>{
        return this.query('SELECT * FROM Usuarios WHERE usuario = ? AND CONTRASENA = ? AND estado = ?', [user, password, 1]);
    }

    getTarifas(ciudad:string):Promise<any>{
        return this.query('SELECT TIPO_TARIFA, ID_ESTADO, rowid FROM Tarifas WHERE CIUDAD = ? AND ID_ESTADO = ? GROUP BY TIPO_TARIFA ', [ciudad, 1]);
    }

    getCampanias(ciudad:string, tarifa:string):Promise<any>{
        return this.query('SELECT CAMPANA_TARIFA FROM Tarifas WHERE CIUDAD = ? AND TIPO_TARIFA = ? AND ID_ESTADO = ?  GROUP BY CAMPANA_TARIFA', [ciudad, tarifa, 1]); 
    }

    getRangoFinal(ciudad:string, tarifa:string, campania:string, usuarios:number):Promise<any>{
        let fw = 'FROM tarifas WHERE CIUDAD = "'+ciudad+'" AND TIPO_TARIFA = "'+tarifa+'" AND CAMPANA_TARIFA = "'+campania+'" AND ID_ESTADO = 1';
        return this.query('SELECT MIN(RANGO_FINAL_PERSONA) as rango '+fw+' AND RANGO_FINAL_PERSONA BETWEEN ( CASE WHEN "'+usuarios+'" > (SELECT MAX(RANGO_FINAL_PERSONA) '+fw+') THEN (SELECT MAX(RANGO_FINAL_PERSONA) '+fw+' ) ELSE "'+usuarios+'" END) AND  (SELECT MAX(RANGO_FINAL_PERSONA) '+fw+')')       
    }

    getModalidadPago(ciudad:string, tarifa:string, campania:string):Promise<any>{
        return this.query('SELECT  *, rowid FROM Tarifas WHERE CIUDAD = ? AND TIPO_TARIFA = ?  AND CAMPANA_TARIFA = ? AND ID_ESTADO = ?  GROUP BY MODALIDAD_PAGO ORDER BY MODALIDAD_PAGO DESC  ', [ciudad, tarifa, campania, 1])
    }


    getPagoTarifa(ciudad:string, tarifa:string, campania:string, rango:string,  modalidad:string):Promise<any>{
        return this.query('SELECT *,rowid FROM Tarifas WHERE CIUDAD = ? AND TIPO_TARIFA = ?  AND CAMPANA_TARIFA = ? AND ID_ESTADO = ? AND RANGO_FINAL_PERSONA = ? AND MODALIDAD_PAGO = ?   GROUP BY FORMA_PAGO ', [ciudad, tarifa, campania, 1, rango, modalidad]);
    }


    getPagoTarifas(ciudad:string, tarifa:string, campania:string, modalidad:string, usuarios:number):Promise<any>{
        return this.query('SELECT *,rowid FROM Tarifas WHERE CIUDAD = ? AND TIPO_TARIFA = ?  AND CAMPANA_TARIFA = ? AND ID_ESTADO = ? AND MODALIDAD_PAGO = ? AND  '+ usuarios +'  BETWEEN RANGO_INICIAL_PERSONA AND RANGO_FINAL_PERSONA  GROUP BY FORMA_PAGO ORDER BY ORDEN ASC ', [ciudad, tarifa, campania, 1, modalidad]);
    }

    getTarifaPlena(ciudad:string):Promise<any>{
        return this.query('SELECT *,rowid FROM TarifaPlena WHERE CIUDAD = ? ', [ciudad]);
    }


    /**
     * Remove the value in the database for the given key.
     * @param {string} key the key
     * @return {Promise} that resolves or rejects with an object of the form { tx: Transaction, res: Result (or err)}
     */
    remove(key: string): Promise<any> {
        return this.query('delete from kv where key = ?', [key]);
    }

    /**
     * Clear all keys/values of your database.
     * @return {Promise} that resolves or rejects with an object of the form { tx: Transaction, res: Result (or err)}
     */
    clear(): Promise<any> {
        //return this.query('delete from kv');
        return this.query('delete from Usuarios');
    }


    clearUsers():void {
        this.query('DELETE FROM Usuarios');        
    }

    clearTarifas():void {
        this.query('DELETE FROM Tarifas');        
    }

    clearTarifaPlena():void {
        this.query('DELETE FROM TarifaPlena');        
    }
    clearDropTarifas():void {
        //return this.query('delete from kv');
        this.query('DELETE FROM Tarifas');
        this.query('DROP TABLE Tarifas');        
    }

    clearAll():void {
        //return this.query('delete from kv');
        this.query('DELETE FROM Usuarios');
        this.query('DELETE FROM Tarifas');
        this.query('DROP TABLE Usuarios');
        this.query('DROP TABLE Tarifas');        
    }

}