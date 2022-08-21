import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  serverUrl = 'https://camerent-backend.herokuapp.com';
  constructor(public http:HttpClient) { }


  getProducts(){
    return this.http.get(this.serverUrl+'/admin-dash');
  }

  // get single product
  getSingleProduct(pid:any){
    return this.http.get(this.serverUrl+`/admin-dash/${pid}`);
  }
  
  
  // register new account
  registerAcc(data:any){
    this.http.post(this.serverUrl+'/register',{'user': data})
      .subscribe()
  }

}
