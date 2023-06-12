const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

// Get all tags
router.get('/', async (req, res) => {
  try {
    // Find all tags
    // Be sure to include associated Product data
    const tags = await Tag.findAll({
      include: [{ model: Product, through: ProductTag }],
    });
    res.json(tags);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Get one tag
router.get('/:id', async (req, res) => {
  try {
    // Find a single tag by its `id`
    // Be sure to include associated Product data
    const tag = await Tag.findByPk(req.params.id, {
      include: [{ model: Product, through: ProductTag }],
    });
    if (!tag) {
      res.status(404).json({ message: 'Tag not found' });
      return;
    }
    res.json(tag);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Create new tag
router.post('/', async (req, res) => {
  try {
    // Create a new tag
    const tag = await Tag.create(req.body);
    res.status(201).json(tag);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Update tag
router.put('/:id', async (req, res) => {
  try {
    // Update a tag's name by its `id` value
    const [affectedRows] = await Tag.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    if (affectedRows === 0) {
      res.status(404).json({ message: 'Tag not found' });
      return;
    }

    res.json({ message: 'Tag updated successfully' });
  } catch (error) {
    res.status(500).json(error);
  }
});

// Delete tag
router.delete('/:id', async (req, res) => {
  try {
    // Delete one tag by its `id` value
    const affectedRows = await Tag.destroy({
      where: { id: req.params.id },
    });

    if (affectedRows === 0) {
      res.status(404).json({ message: 'Tag not found' });
      return;
    }

    res.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
