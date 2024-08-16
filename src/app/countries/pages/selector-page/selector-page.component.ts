import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CountriesService } from '../../services/countries.service';
import { Country, Region, SmallCountry } from '../../interfaces/country.interfaces';
import { filter, map, Observable, switchMap, tap } from 'rxjs';

@Component({
  selector: 'countries-selector-page',
  templateUrl: './selector-page.component.html',
  styles: ``
})

export class SelectorPageComponent implements OnInit{

  public countriesByRegion: SmallCountry[] = [];
  public countryBorders: SmallCountry[] = [];

  public myForm: FormGroup = this.fb.group({
    region:  [ '', Validators.required ],
    country: [ '', Validators.required ],
    borders: [ '', Validators.required ],
  })

  constructor(
    private fb: FormBuilder,
    private countriesService: CountriesService
  ) {}

  ngOnInit(): void {
    this.onRegionChanged();
    this.onCountryChanged();
  }

  get regions(): Region[] {
    return this.countriesService.regions;
  }

  onRegionChanged(): void {
    this.myForm.get('region')!.valueChanges
      .pipe(
        tap( ( ) => this.myForm.get('country')!.setValue('') ),
        switchMap( ( region ) => this.countriesService.getCounbtriesByRegion( region ) ),
      )
      .subscribe( countries => {
        this.countriesByRegion = countries;
      })
  }

  onCountryChanged(): void {
    this.myForm.get('country')!.valueChanges
      .pipe(
        tap<string>( ( ) => this.myForm.get('borders')!.setValue('')),
        tap<string>( ( ) => this.countryBorders = []),
        filter<string>( ( alphaCode: string ) => alphaCode.length > 0),
        map<string, SmallCountry>( alphaCode => {
          return this.countriesByRegion.find( ({ cca3 }) => cca3 === alphaCode )!
        }),
        filter<SmallCountry>( ({ borders }) => borders.length > 0),
        switchMap<SmallCountry, Observable<SmallCountry[]>>( ({ borders }) => {
          return this.countriesService.getCountryBorderByCodes( borders )
        }),
      )
      .subscribe( countries => this.countryBorders = countries )
  }


}
