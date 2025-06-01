# Bookmarker PWA - User Documentation

## Introduction

Bookmarker is a modern Progressive Web App (PWA) for organizing and managing your bookmarks. It works offline, can be installed on your device, and provides powerful features for organizing, searching, and sharing your bookmarks.

## Getting Started

### Installation

Bookmarker can be installed on your device for a native app-like experience:

1. Visit the Bookmarker website in a supported browser (Chrome, Edge, Firefox, Safari)
2. You'll see an install prompt or an install icon in the address bar
3. Click "Install" to add Bookmarker to your device
4. The app will now appear on your home screen or app launcher

Alternatively, you can use Bookmarker directly in your browser without installation.

### First Launch

When you first launch Bookmarker, it will:
1. Initialize a local database on your device
2. Show you the empty bookmarks view
3. Guide you through adding your first bookmark

## Core Features

### Adding Bookmarks

There are several ways to add bookmarks:

1. **Manual Entry**:
   - Click the "+" button in the top right corner
   - Enter the URL, title, and optional description
   - Select categories (optional)
   - Click "Save"

2. **Share from Browser**:
   - While browsing a website, use your browser's share feature
   - Select "Bookmarker" from the share options
   - The bookmark will be automatically added with the page title and URL

3. **Clipboard Detection**:
   - Copy a URL to your clipboard
   - Open the "Add Bookmark" dialog in Bookmarker
   - The URL will be automatically detected and filled in

### Managing Categories

Categories help you organize your bookmarks:

1. **Creating Categories**:
   - Click the "+" button next to "Categories" in the sidebar
   - Enter a name and select a color
   - Click "Save"

2. **Editing Categories**:
   - Right-click on a category in the sidebar
   - Select "Edit" from the context menu
   - Update the name or color
   - Click "Save"

3. **Deleting Categories**:
   - Right-click on a category in the sidebar
   - Select "Delete" from the context menu
   - Confirm deletion

### Searching and Filtering

Bookmarker provides powerful search and filtering capabilities:

1. **Quick Search**:
   - Click the search icon in the top bar
   - Enter your search query
   - Results will appear as you type

2. **Advanced Filtering**:
   - Select a category from the sidebar to filter by category
   - Use the sort button to sort by different criteria (date added, title, etc.)
   - Combine category filters with search for precise results

3. **View Options**:
   - Toggle between grid and list views using the view buttons
   - Grid view shows more visual information
   - List view shows more bookmarks at once

### Bookmark Management

Manage your bookmarks with these actions:

1. **Opening Bookmarks**:
   - Click on a bookmark card to open the URL in a new tab
   - The visit will be recorded in your bookmark history

2. **Editing Bookmarks**:
   - Click the edit icon on a bookmark card
   - Update any information
   - Click "Save"

3. **Deleting Bookmarks**:
   - Click the delete icon on a bookmark card
   - Confirm deletion

4. **Sharing Bookmarks**:
   - Click the share icon on a bookmark card
   - Select your sharing method from the system share dialog
   - If sharing is not supported, the URL will be copied to your clipboard

## Advanced Features

### Import and Export

Bookmarker allows you to import and export your bookmarks:

1. **Exporting**:
   - Go to the "Import/Export" section from the sidebar
   - Click "Export Bookmarks"
   - A JSON file containing all your bookmarks and categories will be downloaded

2. **Importing**:
   - Go to the "Import/Export" section from the sidebar
   - Click "Import Bookmarks"
   - Select a JSON file to import
   - Choose whether to merge with or replace existing data
   - Confirm import

### Settings

Customize your Bookmarker experience:

1. **Theme**:
   - Go to "Settings" in the sidebar
   - Select your preferred theme (Light, Dark, or System)
   - Changes apply immediately

2. **View Preferences**:
   - Set your default view mode (Grid or List)
   - Set your default sort order

3. **Data Management**:
   - Enable or disable automatic metadata fetching
   - Clear application data if needed

## Offline Usage

Bookmarker works fully offline:

1. **Offline Access**:
   - All your bookmarks are stored locally on your device
   - You can view, add, edit, and delete bookmarks without an internet connection

2. **Sync Status**:
   - An offline indicator appears when you're not connected
   - Changes made offline will be preserved

3. **Limitations**:
   - Favicon fetching requires an internet connection
   - Opening bookmarks requires an internet connection

## Troubleshooting

### Common Issues

1. **Installation Problems**:
   - Ensure your browser supports PWA installation
   - Make sure you're using HTTPS
   - Clear browser cache and try again

2. **Data Not Saving**:
   - Check if your browser has storage restrictions
   - Ensure you haven't blocked storage permissions
   - Try using a different browser

3. **Performance Issues**:
   - If the app becomes slow, try clearing old bookmarks you no longer need
   - Export your data periodically as a backup

### Support

For additional support or to report issues:
- Check the GitHub repository: [github.com/bookmarker-pwa](https://github.com/bookmarker-pwa)
- Submit issues through the repository's issue tracker
- Contact the developer at support@bookmarker-pwa.example.com

## Privacy and Security

Bookmarker respects your privacy:

1. **Local Storage**:
   - All your data is stored locally on your device
   - No data is sent to any servers
   - Your bookmarks remain private to you

2. **Permissions**:
   - Clipboard access (optional) - for detecting URLs
   - Storage - for saving your bookmarks
   - Share target - for receiving shared links

## Technical Information

Bookmarker is built with modern web technologies:

- **Frontend**: HTML, CSS, and vanilla JavaScript
- **Database**: SQLite running in WebAssembly
- **Storage**: Origin Private File System (OPFS) with localStorage fallback
- **PWA Features**: Service Worker, Web App Manifest, Share Target API

## License

Bookmarker is released under the MIT License.

---

Thank you for using Bookmarker! We hope it helps you organize and access your bookmarks more efficiently.
