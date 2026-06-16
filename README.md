# Help-Me DA Vers. web - GitHub Pages

Questa cartella contiene la versione pronta da pubblicare su GitHub Pages.

## File da caricare

- `index.html`
- `styles.css`
- `app.js`
- `.nojekyll`

Non caricare `server.js` o `start-help-me-da-web.cmd`: servono solo per test locale sul tuo PC.

## Pubblicazione rapida da browser

1. Accedi a GitHub.
2. Crea un nuovo repository, per esempio `help-me-da-web`.
3. Se usi GitHub Free, scegli repository pubblico.
4. Entra nel repository.
5. Premi `Add file` > `Upload files`.
6. Trascina dentro i file di questa cartella.
7. Premi `Commit changes`.
8. Vai in `Settings` > `Pages`.
9. In `Build and deployment`, scegli:
   - `Source`: `Deploy from a branch`
   - `Branch`: `main`
   - cartella: `/root`
10. Salva.

Dopo qualche minuto il sito sara disponibile all'indirizzo:

```text
https://TUO-USERNAME.github.io/help-me-da-web/
```

GitHub indica l'URL esatto nella pagina `Settings` > `Pages`.

## Nota importante sull'e-mail

GitHub Pages ospita solo file statici e non esegue codice server. Per questo motivo l'invio automatico diretto della mail non puo funzionare da GitHub Pages senza un servizio esterno.

La pagina continuera comunque a permettere:

- apertura in Outlook Web;
- apertura dell'app e-mail predefinita;
- copia del testo della richiesta.

Per inviare automaticamente a `a2x@hotmail.it` serve aggiungere un backend, per esempio:

- Microsoft Graph;
- Azure Function;
- servizio SMTP autorizzato;
- servizio e-mail transazionale.

## Privacy per test con colleghi

Per la prova pubblica o semi-pubblica, chiedi ai colleghi di usare dati simulati e di non inserire password, informazioni riservate o dati personali non necessari.
