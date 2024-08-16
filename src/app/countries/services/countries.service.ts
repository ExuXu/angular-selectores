import { Injectable } from '@angular/core';
import { Country, Region, SmallCountry } from '../interfaces/country.interfaces';
import { combineLatest, map, Observable, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CountriesService {

  private baseUrl: string = 'https://restcountries.com/v3.1'

  private _regions: Region[] = [ Region.Africa, Region.Europe, Region.Asia, Region.Oceania, Region.America ];
  constructor(
    private httpService: HttpClient,
  ) { }

  get regions(): Region[] {
    return [ ...this._regions]
  }

  getCounbtriesByRegion( region: Region ): Observable<SmallCountry[]> {

    if( !region ) return of([])

    const url: string = `${ this.baseUrl }/region/${ region }?fields=cca3,name,borders`

    return this.httpService.get<Country[]>( url )
      .pipe(
        map<Country[], SmallCountry[]>( countries => countries.map( ({ name: { common }, cca3, borders }) => ({
          name: common,
          cca3,
          borders: borders ?? [],
        }) ) )
      )
  }

  getCountryByAlphaCode( alphaCode: string ): Observable<SmallCountry> {

    if( !alphaCode ) return of({} as SmallCountry);

    const url: string = `${ this.baseUrl }/alpha/${ alphaCode }?fields=cca3,name,borders`
    return this.httpService.get<Country>( url )
      .pipe(
        map<Country, SmallCountry>( ({ name: { common }, cca3, borders }) => ({
          name: common,
          cca3,
          borders: borders ?? [],
        } ) )
      )
  }

  getCountryBorderByCodes( borders: string[] ): Observable<SmallCountry[]> {
    if ( !borders || borders.length === 0 ) return of([] as SmallCountry[] );

    const countriesRequest: Observable<SmallCountry>[] = [];

    borders.forEach( alphaCode => {
      const request = this.getCountryByAlphaCode( alphaCode );
      countriesRequest.push( request );
    });

    return combineLatest( countriesRequest );
  }

}
