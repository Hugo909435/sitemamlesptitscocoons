<?php
/**
 * Sitemap dynamique — MAM Les P'tits Cocoons
 * Accessible via /sitemap.xml (rewrite .htaccess)
 */

define('SITE_URL',    'https://mamlesptitscocoons.com');
define('CACHE_FILE',  __DIR__ . '/.sitemap_cache.xml');
define('CACHE_TTL',   3600); // secondes (1 heure)

/* ── Cache fichier ── */
if (file_exists(CACHE_FILE) && (time() - filemtime(CACHE_FILE)) < CACHE_TTL) {
    header('Content-Type: application/xml; charset=utf-8');
    header('Cache-Control: public, max-age=' . CACHE_TTL);
    readfile(CACHE_FILE);
    exit;
}

/* ── Définition des pages publiques ── */
$pages = [
    [
        'loc'        => SITE_URL . '/',
        'file'       => __DIR__ . '/index.html',
        'changefreq' => 'weekly',
        'priority'   => '1.0',
    ],
];

/* ── Génération XML ── */
$xml  = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
$xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"' . "\n";
$xml .= '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' . "\n";
$xml .= '        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9' . "\n";
$xml .= '                            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">' . "\n";

foreach ($pages as $page) {
    $lastmod = file_exists($page['file'])
        ? date('Y-m-d', filemtime($page['file']))
        : date('Y-m-d');

    $xml .= "  <url>\n";
    $xml .= '    <loc>'        . htmlspecialchars($page['loc'], ENT_XML1) . "</loc>\n";
    $xml .= '    <lastmod>'    . $lastmod                                 . "</lastmod>\n";
    $xml .= '    <changefreq>' . $page['changefreq']                      . "</changefreq>\n";
    $xml .= '    <priority>'   . $page['priority']                        . "</priority>\n";
    $xml .= "  </url>\n";
}

$xml .= '</urlset>';

/* ── Écriture du cache ── */
file_put_contents(CACHE_FILE, $xml, LOCK_EX);

/* ── Réponse HTTP ── */
header('Content-Type: application/xml; charset=utf-8');
header('Cache-Control: public, max-age=' . CACHE_TTL);
echo $xml;
