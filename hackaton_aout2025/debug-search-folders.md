# 🔍 Guide de Débogage - Recherche de Dossiers

## 🎯 Problème
Les dossiers ne s'affichent pas dans les résultats de recherche de la barre des tâches.

## 🔧 Étapes de débogage

### **Étape 1: Vérifier les logs de la console**

1. Ouvrir les **Outils de développement** (F12)
2. Aller dans l'onglet **Console**
3. Taper quelque chose dans la barre de recherche
4. Vérifier les logs suivants :
   ```
   🔍 Recherche en cours pour: [votre recherche]
   📄 Fichiers trouvés: X [liste des fichiers]
   📁 Dossiers trouvés: X [liste des dossiers]
   🎯 Total des résultats: X
   ```

### **Étape 2: Tester les endpoints backend**

1. Ouvrir le fichier `test-search-debug.html` dans le navigateur
2. Cliquer sur **"Tester Connexion Backend"**
3. Cliquer sur **"Rechercher Dossiers"** avec le terme "test"
4. Vérifier les réponses

### **Étape 3: Vérifier les données de test**

#### **Créer des données de test :**
1. Ouvrir l'**Explorateur de fichiers**
2. Créer un dossier nommé "TestRecherche"
3. Créer un fichier texte nommé "test.txt"
4. Retourner à la recherche et taper "test"

### **Étape 4: Vérifier la configuration**

#### **Frontend (`file-service.ts`) :**
- ✅ URL corrigée : `/files/folders/search`
- ✅ Gestion d'erreur en place
- ✅ Logs de débogage ajoutés

#### **Backend :**
- ✅ Endpoint : `GET /api/v2/files/folders/search`
- ✅ Méthode repository ajoutée
- ✅ Service implémenté

## 🐛 Problèmes possibles et solutions

### **Problème 1: Backend non redémarré**
**Symptômes :** Erreur 404 ou 500 sur l'endpoint
**Solution :** Redémarrer le serveur Spring Boot

### **Problème 2: Aucun dossier dans la base**
**Symptômes :** Endpoint fonctionne mais retourne `[]`
**Solution :** Créer des dossiers de test

### **Problème 3: Erreur CORS**
**Symptômes :** Erreur dans la console du navigateur
**Solution :** Vérifier la configuration CORS du backend

### **Problème 4: Problème de conversion DTO**
**Symptômes :** Données reçues mais pas affichées
**Solution :** Vérifier `folderDtoToFileItem()`

## 📊 Tests à effectuer

### **Test 1: Recherche simple**
```
Recherche: "test"
Attendu: Dossiers et fichiers contenant "test"
```

### **Test 2: Recherche par nom exact**
```
Recherche: "TestRecherche"
Attendu: Le dossier "TestRecherche"
```

### **Test 3: Recherche vide**
```
Recherche: ""
Attendu: Aucun résultat
```

### **Test 4: Recherche avec caractères spéciaux**
```
Recherche: "test-123"
Attendu: Éléments contenant "test-123"
```

## 🔍 Logs à surveiller

### **Console du navigateur :**
```javascript
🔍 Recherche en cours pour: test
📄 Fichiers trouvés: 2 ["test.txt", "autre_test.txt"]
📁 Dossiers trouvés: 1 ["TestRecherche"]
🎯 Total des résultats: 3
```

### **Logs du backend :**
```
Hibernate: SELECT f FROM Folder f WHERE f.user = ? AND f.name LIKE %test%
```

## 🎯 Résultat attendu

Après correction, la recherche devrait afficher :
- ✅ **Applications** (comme avant)
- ✅ **Fichiers** (comme avant)
- ✅ **Dossiers** (nouveau !)

### **Exemple de résultats pour "test" :**
```
📁 TestRecherche (Dossier)
📄 test.txt (Fichier)
📄 autre_test.txt (Fichier)
🧮 Calculatrice (Application) - si pertinent
```

## 🚨 Si le problème persiste

1. **Vérifier les logs** de la console du navigateur
2. **Tester les endpoints** avec le fichier HTML de test
3. **Vérifier la base de données** pour s'assurer qu'il y a des dossiers
4. **Redémarrer le backend** après les modifications
5. **Vider le cache** du navigateur (Ctrl+F5)

## 📞 Informations de débogage

- **URL de l'API :** `http://localhost:8080/api/v2`
- **Endpoint dossiers :** `/files/folders/search`
- **Endpoint fichiers :** `/files/search`
- **User ID par défaut :** `1` 