import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { todo } from 'node:test';

const routes: Routes = [];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }