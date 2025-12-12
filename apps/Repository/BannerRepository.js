class BannerRepository {
    context;
    session;

    constructor(context, session = null) {
        this.context = context;
        this.session = session;
    }

    async insertBanner(banner) {
        return await this.context
            .collection("banner")
            .insertOne(banner, { session: this.session });
    }

    async getBanners() {
        return await this.context.collection("banner").find().toArray();
    }
}

module.exports = BannerRepository;
