const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// Get all products
router.get('/', async (req, res) => {
  try {
    // Find all products
    const products = await Product.findAll({
      include: [{ model: Category }, { model: Tag, through: ProductTag }],
    });
    res.json(products);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Get one product
router.get('/:id', async (req, res) => {
  try {
    // Find a single product by its `id`
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Category }, { model: Tag, through: ProductTag }],
    });
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.json(product);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Create new product
router.post('/', async (req, res) => {
  try {
    const product = await Product.create(req.body);

    // If there are product tags, create pairings to bulk create in the ProductTag model
    if (req.body.tagIds && req.body.tagIds.length) {
      const productTagIdArr = req.body.tagIds.map((tagId) => {
        return {
          product_id: product.id,
          tag_id: tagId,
        };
      });
      await ProductTag.bulkCreate(productTagIdArr);
    }

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Update product
router.put('/:id', async (req, res) => {
  try {
    // Update product data
    const [affectedRows] = await Product.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    if (affectedRows === 0) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    // Find all associated tags from ProductTag
    const productTags = await ProductTag.findAll({
      where: { product_id: req.params.id },
    });

    // Get list of current tag_ids
    const productTagIds = productTags.map(({ tag_id }) => tag_id);

    // Create a filtered list of new tag_ids
    const newProductTags = req.body.tagIds
      .filter((tagId) => !productTagIds.includes(tagId))
      .map((tagId) => {
        return {
          product_id: req.params.id,
          tag_id: tagId,
        };
      });

    // Figure out which ones to remove
    const productTagsToRemove = productTags
      .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
      .map(({ id }) => id);

    // Run both actions
    await Promise.all([
      ProductTag.destroy({ where: { id: productTagsToRemove } }),
      ProductTag.bulkCreate(newProductTags),
    ]);

    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    res.status(500).json(error);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    // Delete one product by its `id` value
    const affectedRows = await Product.destroy({
      where: { id: req.params.id },
    });

    if (affectedRows === 0) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
