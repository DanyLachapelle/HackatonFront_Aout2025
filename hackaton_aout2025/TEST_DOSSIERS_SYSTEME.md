# 🧪 Guide de Test - Dossiers Système Frontend

## 🎯 Objectif
Vérifier que les modifications frontend fonctionnent correctement avec le nouveau système de dossiers racine.

## 📋 Prérequis
1. ✅ Backend démarré avec les modifications des dossiers système
2. ✅ Migration SQL exécutée
3. ✅ Frontend démarré avec les nouvelles modifications

## 🧪 Tests à Effectuer

### **Test 1: Vérification de l'Explorateur de Fichiers**

#### **1.1 Affichage de la racine**
1. Ouvrir l'**Explorateur de fichiers**
2. Vérifier que seuls les **4 dossiers système** s'affichent :
   - 🖥️ Bureau
   - 🎵 Musique  
   - 🖼️ Images
   - 📄 Documents
3. ✅ **Résultat attendu** : Aucun autre fichier/dossier à la racine

#### **1.2 Icônes des dossiers système**
1. Vérifier que chaque dossier système a sa bonne icône :
   - Bureau : 🖥️
   - Musique : 🎵
   - Images : 🖼️
   - Documents : 📄
3. ✅ **Résultat attendu** : Icônes correctes affichées

#### **1.3 Création interdite à la racine**
1. Clic droit dans l'explorateur à la racine
2. Essayer de créer un nouveau dossier ou fichier
3. ✅ **Résultat attendu** : Message d'erreur "Impossible de créer des fichiers ou dossiers à la racine"

### **Test 2: Drag & Drop sur le Bureau**

#### **2.1 Upload de fichiers**
1. Glisser-déposer un fichier depuis l'explorateur Windows vers le bureau
2. Vérifier que le fichier apparaît sur le bureau
3. ✅ **Résultat attendu** : Fichier visible sur le bureau et stocké dans `/bureau`

#### **2.2 Types de fichiers acceptés**
1. Tester avec différents types de fichiers :
   - Fichier texte (.txt)
   - Image (.jpg, .png)
   - Audio (.mp3)
   - Document (.pdf)
3. ✅ **Résultat attendu** : Tous les types acceptés sur le bureau

### **Test 3: Application Musique**

#### **3.1 Chargement depuis le dossier système**
1. Ouvrir l'application **Musique**
2. Vérifier que seuls les fichiers du dossier `/musique` s'affichent
3. ✅ **Résultat attendu** : Playlist vide si aucun fichier audio dans `/musique`

#### **3.2 Ajout de fichiers audio**
1. Ajouter un fichier .mp3 dans le dossier `/musique` via l'explorateur
2. Recharger l'application Musique
3. ✅ **Résultat attendu** : Fichier audio visible dans la playlist

#### **3.3 Filtrage des types**
1. Essayer d'ajouter un fichier image dans `/musique`
2. ✅ **Résultat attendu** : Fichier rejeté ou non affiché

### **Test 4: Application Images**

#### **4.1 Chargement depuis le dossier système**
1. Ouvrir l'application **Images**
2. Vérifier que seuls les fichiers du dossier `/images` s'affichent
3. ✅ **Résultat attendu** : Galerie vide si aucune image dans `/images`

#### **4.2 Ajout d'images**
1. Ajouter des fichiers image (.jpg, .png) dans le dossier `/images`
2. Recharger l'application Images
3. ✅ **Résultat attendu** : Images visibles dans la galerie

#### **4.3 Filtrage des types**
1. Essayer d'ajouter un fichier audio dans `/images`
2. ✅ **Résultat attendu** : Fichier rejeté ou non affiché

### **Test 5: Navigation dans les Dossiers Système**

#### **5.1 Ouverture des dossiers**
1. Double-cliquer sur chaque dossier système
2. Vérifier que l'explorateur s'ouvre dans le bon dossier
3. ✅ **Résultat attendu** : Navigation correcte vers chaque dossier

#### **5.2 Création dans les dossiers**
1. Dans chaque dossier système, essayer de créer :
   - Un sous-dossier (dans Bureau et Documents uniquement)
   - Un fichier (selon les restrictions)
3. ✅ **Résultat attendu** : 
   - Bureau : Tout autorisé
   - Documents : Fichiers texte/PDF autorisés
   - Musique : Fichiers audio uniquement
   - Images : Fichiers image uniquement

### **Test 6: Recherche dans la Barre des Tâches**

#### **6.1 Recherche de dossiers système**
1. Taper "bureau", "musique", "images", "documents" dans la recherche
2. ✅ **Résultat attendu** : Dossiers système trouvés et affichés

#### **6.2 Recherche de fichiers**
1. Ajouter des fichiers dans les dossiers système
2. Rechercher ces fichiers par nom
3. ✅ **Résultat attendu** : Fichiers trouvés et affichés

## 🐛 Problèmes Courants et Solutions

### **Problème 1: Dossiers système non visibles**
**Symptôme** : Aucun dossier à la racine
**Solution** : 
1. Vérifier que le backend est démarré
2. Vérifier que la migration SQL a été exécutée
3. Redémarrer le frontend

### **Problème 2: Drag & Drop ne fonctionne pas**
**Symptôme** : Fichiers non ajoutés au bureau
**Solution** :
1. Vérifier la console du navigateur pour les erreurs
2. Vérifier que le dossier `/bureau` existe
3. Vérifier les permissions CORS

### **Problème 3: Applications vides**
**Symptôme** : Musique/Images affichent des listes vides
**Solution** :
1. Vérifier que les dossiers `/musique` et `/images` existent
2. Ajouter des fichiers de test dans ces dossiers
3. Vérifier les logs de l'application

### **Problème 4: Erreurs de création**
**Symptôme** : Impossible de créer des fichiers/dossiers
**Solution** :
1. Vérifier que vous n'êtes pas à la racine
2. Vérifier les restrictions de type de fichier
3. Vérifier les logs du backend

## 📊 Checklist de Validation

- [ ] Explorateur affiche les 4 dossiers système à la racine
- [ ] Icônes correctes pour chaque dossier système
- [ ] Création interdite à la racine
- [ ] Drag & drop fonctionne sur le bureau
- [ ] Application Musique lit depuis `/musique`
- [ ] Application Images lit depuis `/images`
- [ ] Navigation fonctionne dans tous les dossiers
- [ ] Restrictions de création respectées
- [ ] Recherche trouve les dossiers et fichiers
- [ ] Aucune erreur dans la console

## 🎉 Validation Finale

Si tous les tests passent, le système de dossiers racine est correctement implémenté ! 

**Fonctionnalités validées :**
- ✅ Structure de dossiers système
- ✅ Restrictions de création
- ✅ Intégration avec les applications
- ✅ Drag & drop sur le bureau
- ✅ Navigation et recherche
- ✅ Interface utilisateur cohérente 