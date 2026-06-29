import {Injectable} from '@angular/core';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {KitApiEndpoint} from './kit-api-endpoint';
import {HttpClient} from '@angular/common/http';
import {Kit} from '../domain/model/kit.entity';
import {Observable} from 'rxjs';

@Injectable({providedIn: 'root'})
export class KitApi extends BaseApi {
  private readonly kitEndpoint: KitApiEndpoint;

  constructor(http: HttpClient) {
    super();
    this.kitEndpoint = new KitApiEndpoint(http);
  }

  /**
   * Obtiene todos los kits
   * @returns Observable con array de kits
   */
  getKits(): Observable<Kit[]> {
    return this.kitEndpoint.getAll();
  }

  /**
   * Obtiene un kit por su ID
   * @param id - ID del kit
   * @returns Observable con el kit
   */
  getKitById(id: number): Observable<Kit> {
    return this.kitEndpoint.getById(id);
  }

  /**
   * Crea un nuevo kit
   * @param kit - El kit a crear
   * @returns Observable con el kit creado
   */
  createKit(kit: Kit): Observable<Kit> {
    return this.kitEndpoint.create(kit);
  }

  /**
   * Actualiza un kit existente
   * @param kit - El kit con los datos actualizados
   * @param id - ID del kit a actualizar
   * @returns Observable con el kit actualizado
   */
  updateKit(kit: Kit, id: number): Observable<Kit> {
    return this.kitEndpoint.update(kit, id);
  }

  /**
   * Elimina un kit
   * @param id - ID del kit a eliminar
   * @returns Observable void
   */
  deleteKit(id: number): Observable<void> {
    return this.kitEndpoint.delete(id);
  }
}

