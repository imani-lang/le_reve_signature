const NUMERO_WHATSAPP = "213540234248"; 

const CHAMPS_MESURES = {
  "2d": [
    { id:"longueur", label:"Longueur (cm)" },
    { id:"largeur",  label:"Largeur (cm)" },
  ],
  "3d": [
    { id:"longueur", label:"Longueur (cm)" },
    { id:"largeur",  label:"Largeur (cm)" },
    { id:"hauteur",  label:"Hauteur (cm)" },
  ],
};

const session = {
  produitCourant: null,   
  modeleCourant: null,    
};

let memoireCompte = null;
let memoireSession = null;

function sauvegarderCompte(compte){
  memoireCompte = compte;
  try{ localStorage.setItem("lrc_compte", JSON.stringify(compte)); }catch(e){ /* stockage indisponible */ }
}
function chargerCompte(){
  try{
    const brut = localStorage.getItem("lrc_compte");
    if(brut) return JSON.parse(brut);
  }catch(e){ }
  return memoireCompte;
}
function definirConnecte(nom){
  memoireSession = nom;
  try{ localStorage.setItem("lrc_session", nom); }catch(e){  }
}
function nomConnecte(){
  try{
    const v = localStorage.getItem("lrc_session");
    if(v) return v;
  }catch(e){  }
  return memoireSession;
}
function estConnecte(){ return !!nomConnecte(); }
function seDeconnecter(){
  memoireSession = null;
  try{ localStorage.removeItem("lrc_session"); }catch(e){ }
}

const navCatalogueLien = document.getElementById("navCatalogue");
if(navCatalogueLien) navCatalogueLien.href = estConnecte() ? "catalogue.html" : "connexion.html";

const navCompteLien = document.getElementById("navCompte");
if(navCompteLien) navCompteLien.href = estConnecte() ? "catalogue.html" : "connexion.html";

const btnDeconnexion = document.getElementById("btnDeconnexion");
if(btnDeconnexion){
  if(estConnecte()){
    btnDeconnexion.classList.remove("cache-onglet");
    btnDeconnexion.addEventListener("click", ()=>{
      seDeconnecter();
      window.location.href = "accueil.html";
    });
  } else {
    btnDeconnexion.classList.add("cache-onglet");
  }
}
const modaleInfos = document.getElementById("modaleInfos");
const btnLogo = document.getElementById("btnLogo");
if(btnLogo && modaleInfos){
  btnLogo.addEventListener("click", ()=> modaleInfos.classList.add("ouverte"));
  document.querySelectorAll("[data-close]").forEach(btn=>{
    btn.addEventListener("click", ()=> document.getElementById(btn.dataset.close).classList.remove("ouverte"));
  });
  modaleInfos.addEventListener("click", (e)=>{ if(e.target === modaleInfos) modaleInfos.classList.remove("ouverte"); });
}

function allerVersCatalogueOuConnexion(){
  window.location.href = estConnecte() ? "catalogue.html" : "connexion.html";
}
const btnCommencer = document.getElementById("btnCommencer");
if(btnCommencer) btnCommencer.addEventListener("click", allerVersCatalogueOuConnexion);

const btnCreation = document.getElementById("btnCreation");
if(btnCreation) btnCreation.addEventListener("click", allerVersCatalogueOuConnexion);

const formConnexion = document.getElementById("formConnexion");
const formInscription = document.getElementById("formInscription");

if(formConnexion && formInscription){

  const compteEnregistre = chargerCompte();
  const ongletInscription = document.querySelector('.onglet[data-onglet="inscription"]');
  if(compteEnregistre){
    if(ongletInscription) ongletInscription.classList.add("cache-onglet");
    const champEmail = formConnexion.querySelector('input[type="email"]');
    if(champEmail) champEmail.value = compteEnregistre.email || "";
  }

  document.querySelectorAll(".onglet").forEach(onglet=>{
    onglet.addEventListener("click", ()=>{
      document.querySelectorAll(".onglet").forEach(o=>o.classList.remove("actif"));
      onglet.classList.add("actif");
      const estConnexionTab = onglet.dataset.onglet === "connexion";
      formConnexion.classList.toggle("cache", !estConnexionTab);
      formInscription.classList.toggle("cache", estConnexionTab);
    });
  });

  function emailValide(email){ return email.includes("@"); }
  function motDePasseValide(motDePasse){ return motDePasse.length > 6; }

  formInscription.addEventListener("submit", (e)=>{
    e.preventDefault();
    const nom = formInscription.querySelector('input[type="text"]').value.trim();
    const telephone = formInscription.querySelector('input[type="tel"]').value.trim();
    const email = formInscription.querySelector('input[type="email"]').value.trim();
    const motDePasse = formInscription.querySelector('input[type="password"]').value;
    const erreur = document.getElementById("erreurInscription");

    if(!nom){ erreur.textContent = "Merci de renseigner votre nom."; return; }
    if(!emailValide(email)){ erreur.textContent = "L'adresse e-mail doit contenir un « @ »."; return; }
    if(!motDePasseValide(motDePasse)){ erreur.textContent = "Le mot de passe doit contenir plus de 6 lettres ou chiffres."; return; }

    erreur.textContent = "";

    sauvegarderCompte({ nom, telephone, email, motDePasse });
    definirConnecte(nom);
    window.location.href = "catalogue.html";
  });

  formConnexion.addEventListener("submit", (e)=>{
    e.preventDefault();
    const email = formConnexion.querySelector('input[type="email"]').value.trim();
    const motDePasse = formConnexion.querySelector('input[type="password"]').value;
    const erreur = document.getElementById("erreurConnexion");

    if(!emailValide(email)){ erreur.textContent = "L'adresse e-mail doit contenir un « @ »."; return; }
    if(!motDePasseValide(motDePasse)){ erreur.textContent = "Le mot de passe doit contenir plus de 6 lettres ou chiffres."; return; }

    const compte = chargerCompte();
    if(compte && compte.email && compte.email.toLowerCase() !== email.toLowerCase()){
      erreur.textContent = "Cette adresse e-mail ne correspond pas au compte enregistré sur cet appareil.";
      return;
    }

    erreur.textContent = "";
    definirConnecte(compte ? compte.nom : email.split("@")[0]);
    window.location.href = "catalogue.html";
  });
}

const sectionCatalogue = document.getElementById("catalogue");

if(sectionCatalogue){

  // Accès protégé : sans connexion, retour à la page de connexion.
  if(!estConnecte()){
    window.location.href = "connexion.html";
  } else {
    const nomClient = document.getElementById("nomClient");
    if(nomClient) nomClient.textContent = ", " + nomConnecte();
  }

  function afficherPage(idPage){
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    const cible = document.getElementById(idPage);
    if(cible){ cible.classList.add("active"); window.scrollTo({top:0, behavior:"smooth"}); }
  }

  document.querySelectorAll(".btn-retour").forEach(btn=>{
    btn.addEventListener("click", ()=> afficherPage(btn.dataset.retour));
  });

  document.querySelectorAll(".btn-commander").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      session.produitCourant = {
        id: btn.dataset.produit,
        nom: btn.dataset.nom,
        type: btn.dataset.type,
      };
      ouvrirModeles(session.produitCourant.id, session.produitCourant.nom);
    });
  });

  function ouvrirModeles(idProduit, nomProduit){
    document.getElementById("titreModeles").textContent = "Modèles — " + nomProduit;
    document.querySelectorAll(".bloc-modeles").forEach(bloc=>{
      bloc.classList.toggle("actif", bloc.dataset.produit === idProduit);
    });
    afficherPage("modeles");
  }

  document.querySelectorAll(".btn-choisir-modele").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const carte = btn.closest(".carte-modele");
      const img = carte.querySelector("img");
      ouvrirPersonnalisation(img.src, img.alt);
    });
  });

  const inputPhotoModelePerso = document.getElementById("inputPhotoModelePerso");
  document.querySelectorAll(".btn-ajouter-modele").forEach(btn=>{
    btn.addEventListener("click", ()=> inputPhotoModelePerso.click());
  });
  if(inputPhotoModelePerso){
    inputPhotoModelePerso.addEventListener("change", (e)=>{
      const fichier = e.target.files[0];
      if(!fichier) return;
      const urlPhoto = URL.createObjectURL(fichier);
      ouvrirPersonnalisation(urlPhoto, "Photo personnalisée du client");
      e.target.value = "";
    });
  }

  function ouvrirPersonnalisation(cheminModele, texteAlt){
    const produit = session.produitCourant;

    document.getElementById("titrePersonnalisation").textContent = "Personnalisez : " + produit.nom;
    document.getElementById("imgModeleChoisi").src = cheminModele;
    document.getElementById("imgModeleChoisi").alt = texteAlt || produit.nom;
    session.modeleCourant = cheminModele;

    const zone = document.getElementById("zoneMesures");
    zone.innerHTML = "";
    CHAMPS_MESURES[produit.type].forEach(champ=>{
      const label = document.createElement("label");
      label.innerHTML = `${champ.label}
        <input type="number" min="1" step="0.5" required data-mesure="${champ.id}" placeholder="ex : 160">`;
      zone.appendChild(label);
    });

    document.getElementById("formCommande").reset();
    document.getElementById("apercuFichier").innerHTML = "";
    document.getElementById("choixCouleur").value = "";

    afficherPage("personnalisation");
  }

  const photoReference = document.getElementById("photoReference");
  if(photoReference){
    photoReference.addEventListener("change", (e)=>{
      const fichier = e.target.files[0];
      const zone = document.getElementById("apercuFichier");
      zone.innerHTML = "";
      if(fichier){
        const img = document.createElement("img");
        img.src = URL.createObjectURL(fichier);
        zone.appendChild(img);
        const nom = document.createElement("p");
        nom.textContent = "Fichier sélectionné : " + fichier.name;
        zone.appendChild(nom);
      }
    });
  }

  const formCommande = document.getElementById("formCommande");
  if(formCommande){
    formCommande.addEventListener("submit", (e)=>{
      e.preventDefault();

      const produit = session.produitCourant;
      const couleur = document.getElementById("choixCouleur").value;
      const notes = document.getElementById("notesCommande").value.trim();

      const lignesMesures = CHAMPS_MESURES[produit.type].map(champ=>{
        const valeur = document.querySelector(`[data-mesure="${champ.id}"]`).value;
        return `- ${champ.label} : ${valeur} cm`;
      }).join("%0A");

      const client = nomConnecte() || "Client";

      let message = `Bonjour Le Rêve Capitonné 👋%0A`;
      message += `Je souhaite commander : *${produit.nom}*%0A%0A`;
      message += `Mesures :%0A${lignesMesures}%0A%0A`;
      message += `Couleur du capitonné : ${couleur}%0A`;
      if(notes){ message += `Remarques : ${notes}%0A`; }
      message += `%0AClient : ${client}%0A`;
      message += `(Photo de référence à joindre ici 📷)`;

      const lienWhatsApp = `https://wa.me/${NUMERO_WHATSAPP}?text=${message}`;
      window.open(lienWhatsApp, "_blank");
    });
  }
}