const WishListModel = require('../models/wishList');
const { validateProductId, validateUserId } = require('../utilities/validator');

const addToWishlist = async (req, res, next) => {
  const { userId, productId } = req.params;
  try {
    const validItem = await validateProductId(productId);
    const validUser = await validateUserId(userId);

    let errorMessage = '';
    if (validItem && validUser) {
      const wishlist = await WishListModel.findOne({ userId: userId });

      if (wishlist) {
        if (wishlist.items.includes(productId)) {
          res.status(400).json({
            success: false,
            message: 'Item already in wishlist',
            items: wishlist.items,
          });
        } else {
          const updatedWishlist = await WishListModel.findOneAndUpdate(
            { userId: userId },
            {
              $push: {
                items: productId,
              },
            },
            {
              new: true,
              runValidators: true,
            }
          );

          res.status(200).json({
            success: true,
            message: 'Item added to wishlist successfully!',
            items: updatedWishlist.items,
          });
        }
      } else {
        const myWishlist = {
          userId: userId,
          items: [productId],
        };

        const newWishlist = await WishListModel.create(myWishlist);

        res.status(200).json({
          success: true,
          message: 'Item added to wishlist successfully!',
          items: newWishlist.items,
        });
      }
    } else {
      if (!validItem) {
        errorMessage = 'Invalid Item';
      } else if (!validUser) {
        errorMessage = 'Invalid User';
      }

      res.status(400).json({
        success: false,
        message: errorMessage,
      });
    }
  } catch (err) {
    res.status(400).json({
      status: false,
      message: err.message,
    });
  }
  // next();
};

const removeFromWishlist = async (req, res, next) => {
  const { userId, productId } = req.params;

  try {
    const validItem = await validateProductId(productId);
    const validUser = await validateUserId(userId);

    let errorMessage = '';
    if (validItem && validUser) {
      const updatedWishlist = await WishListModel.findOneAndUpdate(
        { userId: userId },
        {
          $pull: {
            items: productId,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

      res.status(200).json({
        success: true,
        message: 'Item removed from wishlist successfully!',
        items: updatedWishlist.items,
      });
    } else {
      if (!validItem) {
        errorMessage = 'Invalid Item';
      } else if (!validUser) {
        errorMessage = 'Invalid User';
      }

      res.status(400).json({
        success: false,
        message: errorMessage,
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  // next();
};

const getWishlistItems = async (req, res, next) => {
  const { userId } = req.params;

  try {
    const wishlist = await WishListModel.findOne({ userId: userId });

    if (validateUserId(userId) && wishlist && wishlist.items) {
      res.status(200);
      res.send({ success: true, items: wishlist.items });
    } else if (!validateUserId(userId)) {
      res.status(400).json({ success: false, message: 'Invalid User' });
    } else {
      res.status(400).json({
        success: false,
        message: 'Could not find any items in wishlist',
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  // next();
};

module.exports = {
  addToWishlist,
  removeFromWishlist,
  getWishlistItems,
};
