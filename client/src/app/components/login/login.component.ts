import { Component, OnInit } from '@angular/core';
import { SocialAuthService, SocialUser } from "@abacritt/angularx-social-login";
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  user!: SocialUser;
  loggedIn!: boolean;
  googleToken!: string;
  accessToken!: string;
  name!: string;
  google_id!: string;
  authorizedUsers: boolean = false;


  constructor(private _authService: SocialAuthService, private _userAuthService: AuthService, private _route: Router, private _snackBar: MatSnackBar) { }

  /** Au chargement de la page on va lancer la possibilité de s'authentifier avec google
   */
  ngOnInit() {

    /** On fait appel au service SocialAuthService de Google livré avec le package @abacritt/angularx-social-login qui permet de se connecter avec un bouton google spécifique.
     * Puis on fait appel à la méthode authState qui sert donc à authentifier l'utilisateur google, à récupérer les informations la concernant et à générer un token.
     * @param  {any} userGoogle (infos de l'utilisateur google)
     */
    this._authService.authState.subscribe((userGoogle) => {
      // on récupère les information de la personne qui essaye de s'authentifier avec Google
      this.user = userGoogle; // De class SocialUser de Google.
      // on prend son id et le token pour la suite
      this.google_id = this.user.id;
      this.googleToken = this.user.idToken
     


      /** Puis, on fait appel au service que j'ai créer pour vérifier si l'utilisateur est dans la base de données des utilisateurs authorisés par le biais de son id google
       * @param  { string } this.google_id
       * @param  { SocialUser } this.user
       * @param  { any } response (du service)
       */
      this._userAuthService.postIdGoogle(this.google_id, this.user).subscribe((response: any) => {
        // console.log('response :' + response);
        //  Si le google_id est inclu dans la liste des utilisateurs autorisés de la BDD, on souhaite la bienvenue et on affiche le reste du site
        if (response.includes(this.google_id)) {
          // On parcourt la liste reçue pour comparer
          for (let i = 0; i < response.length; i++) {
            if (response[i].includes(this.google_id)) {
              // console.log("Bienvenue");
              this.authorizedUsers = true;
              this.accessToken = this.user.idToken;
              // On met le token dans le localStorage pour accès au reste du site.
              localStorage.setItem('token', this.accessToken)
              localStorage.setItem('id_google', this.google_id)
              localStorage.setItem('user_name', this.name)
              this._route.navigate(['/home'])
            }
          }
        } else {
          this.authorizedUsers = false;
          userGoogle == null;
          
          // L'utilisateur n'est pas autorisé, une snackbar est envoyé pour l'en informer
          this._snackBar.open("Désolée ! Vous n'êtes pas autorisé à accéder à cette application", 'ok', { verticalPosition: 'top' });

          if (this.googleToken) {
            this.googleToken = "0";
          }
          if (localStorage.getItem('token')) {
            localStorage.clear();
          }
        }
      });

        // Si l'utilisateur fait partie des utilisateurs authorisé, alors il a le droit d'accéder à l'application
        this.loggedIn = (userGoogle != null); // Connecté avec Google
    })

  }

}
