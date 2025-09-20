// Advanced Search API Routes for SHODESH - Using the new MySQL functions and procedures
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Advanced search using the new stored procedure with cursor
router.get('/advanced', async (req, res) => {
    const { 
        q: searchTerm, 
        type = 'basic', 
        limit = 10,
        include_inactive = false 
    } = req.query;
    
    try {
        if (!searchTerm || searchTerm.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Search term must be at least 2 characters long'
            });
        }

        // Call the advanced search stored procedure with cursor
        const [resultSets] = await db.promise().query(
            'CALL sp_advanced_search_with_cursor(?, ?, ?, @result_count, @status, @message)',
            [searchTerm.trim(), parseInt(limit), type]
        );

        // Get the JSON result from the stored procedure
        const searchResult = resultSets[0][0]?.search_result;
        
        if (searchResult) {
            const parsedResult = typeof searchResult === 'string' ? 
                JSON.parse(searchResult) : searchResult;
            
            res.json({
                success: true,
                data: parsedResult
            });
        } else {
            res.json({
                success: false,
                message: 'No search results returned',
                data: { results: [], result_count: 0 }
            });
        }

    } catch (error) {
        console.error('Advanced search error:', error);
        res.status(500).json({
            success: false,
            message: 'Advanced search failed',
            error: error.message
        });
    }
});

// Get search suggestions using similarity function
router.get('/suggestions', async (req, res) => {
    const { q: searchTerm, limit = 5 } = req.query;
    
    try {
        if (!searchTerm || searchTerm.trim().length < 1) {
            return res.json({
                success: true,
                data: { suggestions: [] }
            });
        }

        // Use the advanced view to get suggestions with similarity scoring
        const [rows] = await db.promise().query(`
            SELECT 
                creation_id,
                title,
                creator_name,
                category_name,
                funding_percentage,
                donation_count,
                fn_calculate_text_similarity(?, title) as similarity_score,
                fn_calculate_popularity_score(creation_id) as popularity_score
            FROM v_advanced_searchable_events
            WHERE 
                verification_status = 'verified' 
                AND lifecycle_status = 'active'
                AND (
                    LOWER(title) LIKE CONCAT(?, '%') OR
                    LOWER(category_name) LIKE CONCAT(?, '%') OR
                    fn_calculate_text_similarity(?, title) > 40
                )
            ORDER BY 
                similarity_score DESC,
                popularity_score DESC,
                donation_count DESC
            LIMIT ?
        `, [
            searchTerm.trim(), 
            searchTerm.trim().toLowerCase(), 
            searchTerm.trim().toLowerCase(),
            searchTerm.trim(),
            parseInt(limit)
        ]);

        res.json({
            success: true,
            data: {
                suggestions: rows.map(row => ({
                    creation_id: row.creation_id,
                    title: row.title,
                    creator_name: row.creator_name,
                    category: row.category_name,
                    funding_percentage: row.funding_percentage,
                    donation_count: row.donation_count,
                    similarity_score: row.similarity_score,
                    popularity_score: row.popularity_score
                }))
            }
        });

    } catch (error) {
        console.error('Search suggestions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get suggestions',
            error: error.message
        });
    }
});

module.exports = router;